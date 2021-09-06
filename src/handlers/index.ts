import type { Context, SQSEvent } from 'aws-lambda'
import IOutputProduct from '../interfaces/outputProduct'
import IReport from '../interfaces/report'
import IScrapeRequest from '../interfaces/request'
import IScrapeResponse from '../interfaces/response'
import { getProvider } from '../providers'
import puppeteerRunner from '../runners/puppeteer'
import { sendSnsMessage } from './snsSend'
import { readdir, rm } from 'fs/promises'
import { CrawlEngine } from '../interfaces/request'
import { getS3Client, s3KeyForRequest } from '../service/s3'

const { AWS_LAMBDA_FUNCTION_NAME, SUPPRESS_OUTPUT, USE_S3, USE_SNS, VERSION_HASH } = process.env

const SEND_TO_S3 = !!USE_S3 || (!!AWS_LAMBDA_FUNCTION_NAME && !SUPPRESS_OUTPUT)
const SEND_TO_SNS = !!USE_SNS || (!!AWS_LAMBDA_FUNCTION_NAME && !SUPPRESS_OUTPUT)

async function handleExtractor(
  request: IScrapeRequest,
  extractor: string,
): Promise<IReport<IOutputProduct>> {
  const provider = getProvider(extractor)
  const report = await puppeteerRunner(provider, request)
  return {
    ...report,
    products: report.products?.map(p => p.toJson()),
  }
}

async function handleRequest(
  request: IScrapeRequest,
  crawlStartTime: Date,
): Promise<IScrapeResponse> {
  const { pageUrl, extractors, scheduleTime, crawlEngine } = request
  const extractorVersion = VERSION_HASH

  if (crawlEngine == CrawlEngine.WebScraperIO) {
    console.log('processing webscraper.io requests', request)
    const s3ObjectKey = s3KeyForRequest(request)
    return {
      pageUrl,
      scheduleTime,
      extraUrls: [],
      crawlStartTime,
      timestamp: new Date(),
      extractorVersion,
      extractorResults: [
        {
          products: [{ s3ObjectKey }],
        },
      ],
    }
  } else {
    const extractorResults = await Promise.all(
      extractors.map(extractor => handleExtractor(request, extractor)),
    )

    return {
      pageUrl,
      scheduleTime,
      extraUrls: [],
      crawlStartTime,
      timestamp: new Date(),
      extractorVersion,
      extractorResults,
    }
  }
}

export default async (event: SQSEvent, _context: Context) => {
  const crawlStartTime = new Date()
  const processors = event.Records.map(async message => {
    const request = JSON.parse(message.body) as IScrapeRequest
    const allOutput: IScrapeResponse = await handleRequest(request, crawlStartTime)

    if (AWS_LAMBDA_FUNCTION_NAME)
      allOutput.extractorResults.forEach(result => {
        if (result.error) {
          console.error(
            JSON.stringify({
              success: false,
              stack: 'flamingo-scrapers',
              extractor: request.extractors[0],
              ...request,
              ...result,
            }),
          )
        } else {
          if (result.products?.length) {
            result.products.forEach(product => {
              console.log(
                JSON.stringify({
                  success: true,
                  stack: 'flamingo-scrapers',
                  extractor: request.extractors[0],
                  ...request,
                  ...product,
                  metadata: undefined,
                }),
              )
            })
          } else {
            console.warn(
              JSON.stringify({
                success: true,
                stack: 'flamingo-scrapers',
                extractor: request.extractors[0],
                ...request,
                ...result,
              }),
            )
          }
        }
      })

    if (SEND_TO_S3 && request.crawlEngine !== CrawlEngine.WebScraperIO) {
      const s3Client = getS3Client()
      const s3ObjectKey = s3KeyForRequest(request)
      console.log(`Saving output to ${s3ObjectKey}`)
      await s3Client
        .putObject({
          Body: JSON.stringify(allOutput),
          Bucket: 'scale-scraper-output-us-west-2',
          Key: s3ObjectKey,
        })
        .promise()
      console.log('I guess I saved something?')
      allOutput.extractorResults.forEach(extRes => (extRes.products = [{ s3ObjectKey }]))
    }
    return allOutput
  })
  const processorResults = await Promise.all(processors).catch(e => {
    if (e.code === 'ENOSPC') {
      // out of space, kill process to force lambda to abandon this worker
      process.exit(1)
    }
    throw e
  })

  console.log(`Processed results from ${processors.length} processors`)
  if (SEND_TO_SNS) {
    try {
      const snsResp = await sendSnsMessage(
        processorResults,
        'arn:aws:sns:us-west-2:695567787164:scraper-output-topic',
      )
      console.log(`Published SNS messages: ${JSON.stringify((await snsResp.promise()).MessageId)}`)
    } catch (err) {
      console.log(`Caught exception publishing to SNS: ${err.message}`)
    }
  }
  // console.log(`Full Results: ${JSON.stringify(processorResults)}`)
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FLUSH_TMP) {
    try {
      console.log('Trying to flush /tmp')
      await Promise.all(
        (
          await readdir('/tmp')
        ).map(async x => {
          try {
            await rm(`/tmp/${x}`, { recursive: true })
          } catch (err) {
            console.error('Swallowing rm error')
            console.error(err.message)
          }
        }),
      )
    } catch (err) {
      console.error('Caught an error trying to clear files')
      console.error(err.message)
    }
  }
  return processorResults
}
