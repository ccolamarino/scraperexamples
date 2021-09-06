import axios from 'axios'
import { Lambda } from 'aws-sdk'
import { ArgumentParser } from 'argparse'
import fs from 'fs/promises'

const lambda = new Lambda({
  region: 'us-west-2',
  maxRetries: 3,
  httpOptions: { timeout: 10 * 60 * 1000 },
})

const parser = new ArgumentParser()
parser.add_argument('--function-name', { type: 'str', default: 'FakeScraper' })
parser.add_argument('--function-version', { type: 'str', default: process.env.CIRCLE_SHA1 })
parser.add_argument('--url-delay', { type: 'int', default: 2000 })
parser.add_argument('--max-retries-per-url', { type: 'int', default: 3 })
parser.add_argument('--provider', { type: 'str', action: 'append' })

let {
  function_name: FUNCTION_NAME,
  function_version: FUNCTION_VERSION,
  url_delay: URL_DELAY,
  max_retries_per_url: MAX_RETRIES,
  provider: providers,
} = parser.parse_args()

if (!providers?.length)
  // branch is expected to be of the form <author>/providers/<provider1>+<provider2>...+<providern>
  providers = process.env.CIRCLE_BRANCH!.match(/^provider\/([\w+]+)/)?.[1]!.split('+') ?? []

const delay = (delayMs: number) => new Promise(res => setTimeout(res, delayMs))

async function getUrlsForProvider(provider: string): Promise<string[]> {
  const { data } = await axios.get(
    'https://orchestrator.crawler.scale.com/ci/validate_page_samples',
    {
      auth: { username: process.env.ORCHESTRATOR_API_TOKEN!, password: '' },
      params: { extractor: provider },
    },
  )

  // x can be a string, or a {url, crawlEngine} object
  return data.map(x => x?.url ?? x)
}

function generatePayload(url: string, provider: string) {
  // mimic SQS payload
  return {
    Records: [
      {
        messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
        receiptHandle: 'MessageReceiptHandle',
        body: JSON.stringify({
          pageUrl: url,
          extractors: [provider],
          scheduleTime: new Date().toISOString(),
        }),
        attributes: {
          ApproximateReceiveCount: '1',
          SentTimestamp: '1523232000000',
          SenderId: '123456789012',
          ApproximateFirstReceiveTimestamp: '1523232000001',
        },
        messageAttributes: {},
        eventSource: 'aws:sqs',
        eventSourceARN: 'arn:aws:sqs:us-west-2:123456789012:MyQueue',
        awsRegion: 'us-west-2',
      },
    ],
  }
}

async function tryScrape(url: string, provider: string) {
  const payload = generatePayload(url, provider)
  return lambda
    .invoke({
      FunctionName: FUNCTION_NAME,
      Qualifier: FUNCTION_VERSION,
      Payload: JSON.stringify(payload),
    })
    .promise()
}

async function getFailure(lambdaResponse: any): Promise<string | null> {
  // TODO parses the lambda response to see if there were any failures. If so, returns the details of the failure, else returns null.
  if (lambdaResponse[0].extractorResults?.[0]?.status === '500') {
    return lambdaResponse[0].extractorResults?.[0]?.message ?? 'unknown'
  }

  // For multipage output
  if (lambdaResponse[0].pageOutputs?.[0]?.extractorResults?.[0]?.status === 'error') {
    return (
      JSON.stringify(lambdaResponse[0].pageOutputs?.[0]?.extractorResults?.[0]?.output) ?? 'unknown'
    )
  }
  return null
}

// Runs a provider through a set of URLs.
// Manages retries appropriately, and fails the job if there are too many failures.
async function runProvider(provider: string) {
  const urls = await getUrlsForProvider(provider)
  console.log(`got ${urls.length} urls for provider`)
  const retryCount = {}
  const retries: string[] = [] // list of URLs we want to retry
  const successes: { url: string; response: any }[] = [] // list of successes
  const fails: { url: string; error: any }[] = [] // list of failures
  const allResponses: any[] = [] // list of responses, regardless of success of fail
  const promises: Promise<void>[] = []
  let inprog = 0
  async function* generateUrls() {
    for (const url of urls) {
      yield url
      await delay(URL_DELAY)
    }

    while (true) {
      // handle retries
      if (retries.length) {
        const [url] = retries.splice(0, 1)
        yield url
        await delay(URL_DELAY)
      } else if (inprog == 0) {
        break
      }
      await delay(100)
    }
  }

  // this URL failed with an error, either retry it or mark as failed
  function fail(url: string, error: any) {
    retryCount[url] = retryCount[url] ?? 0
    retryCount[url]++
    if (retryCount[url] > MAX_RETRIES) {
      console.log(`fail: ${url}`, error)
      fails.push({ url, error })
    } else {
      console.log(`fail (retry ${retryCount[url]}/${MAX_RETRIES}): ${url}`, error)
      retries.push(url)
    }
  }

  // this URL was crawled successfully
  function success(url: string, response: any) {
    console.log(`success: ${url}`)
    successes.push({ url, response })
  }

  async function doScrape(url: string): Promise<void> {
    inprog++
    try {
      const { FunctionError, Payload } = await tryScrape(url, provider)
      const response = JSON.parse(Payload?.toString() ?? '{}')
      allResponses.push(response)
      const failure = FunctionError || (await getFailure(response))
      if (failure) {
        return fail(url, failure)
      }
      return success(url, response)
    } catch (e) {
      if (e.message === 'Excessive Failures') throw e
      return fail(url, e)
    } finally {
      inprog--
    }
  }

  async function recordSuccessfulResults() {
    console.log('Recording validation results...')
    await Promise.all(
      allResponses.map(response =>
        axios.post(
          'https://orchestrator.crawler.scale.com/crawling/recordDataForSearch',
          {
            records: [
              {
                source: 'ci-validation',
                hash: process.env.CIRCLE_SHA1,
                ...response[0],
              },
            ],
          },
          {
            auth: { username: process.env.ORCHESTRATOR_API_TOKEN!, password: '' },
          },
        ),
      ),
    )
  }

  for await (const url of generateUrls()) {
    promises.push(doScrape(url))
  }
  await Promise.all(promises)
  await recordSuccessfulResults()

  return { successes, fails }
}

;(async () => {
  const summaries: Record<string, { successCount: number; failCount: number }> = {}
  for (const provider of providers) {
    console.log(`Testing provider ${provider}...`)
    const artifacts = await runProvider(provider)
    summaries[provider] = {
      successCount: artifacts.successes.length,
      failCount: artifacts.fails.length,
    }
    await fs.writeFile(`artifacts/${provider}.json`, JSON.stringify(artifacts, null, 2))
  }
  console.log('==================== SUMMARY ====================')
  for (const [k, v] of Object.entries(summaries)) {
    console.log(`${k}: ${v.successCount} successful, ${v.failCount} failures`)
  }
})().then(
  () => process.exit(0),
  e => {
    console.error(e)
    process.exit(1)
  },
)
