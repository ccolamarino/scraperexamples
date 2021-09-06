import AWS, { S3 } from 'aws-sdk'
import IOutputProduct from '../interfaces/outputProduct'
import IReport from '../interfaces/report'
import IScrapeRequest from '../interfaces/request'
import IScrapeResponse from '../interfaces/response'
import { getProvider } from '../providers'
import puppeteerRunner from '../runners/puppeteer'
import { sendSnsMessage } from './snsSend'
import * as sqs from './sqs'

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
  const { pageUrl, extractors, scheduleTime } = request

  const extractorResults = await Promise.all(
    extractors.map(extractor => handleExtractor(request, extractor)),
  )
  return {
    pageUrl,
    scheduleTime,
    extraUrls: [],
    crawlStartTime,
    timestamp: new Date(),
    extractorResults,
  }
}

let s3Client: S3 | undefined

const getS3Client = async () => {
  if (!s3Client) {
    s3Client = new AWS.S3()
  }
  return s3Client
}

async function main() {
  // TODO: actually have multiple scrapes running at wonce
  while (true) {
    const pollRes = await sqs.receiveMessage()
    if (!pollRes.Messages || pollRes.Messages.length === 0) {
      console.log(`Empty queue from poll`)
      continue
    }
    const crawlStartTime = new Date()
    const processors = pollRes.Messages.map(async message => {
      const request = JSON.parse(message.Body!) as IScrapeRequest
      const allOutput: IScrapeResponse = await handleRequest(request, crawlStartTime)
      if (process.env.USE_S3) {
        const s3Client = await getS3Client()
        const s3ObjectKey = `${sanitizeUrl(request.pageUrl)}/${
          request.scheduleTime || new Date().toISOString()
        }`
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
    const processorResults = await Promise.all(processors)
    console.log(`Processed results from ${processors.length} processors`)
    try {
      const snsResp = await sendSnsMessage(
        processorResults,
        'arn:aws:sns:us-west-2:695567787164:scraper-output-topic',
      )
      for (const message of pollRes.Messages) {
        await sqs.deleteMessage(message.ReceiptHandle!)
      }
      console.log(`Published SNS messages: ${JSON.stringify((await snsResp.promise()).MessageId)}`)
    } catch (err) {
      console.log(`Caught exception publishing to SNS: ${err.message}`)
    }
  }
}

const protocol_re = /https?:\/\//

function sanitizeUrl(pageUrl: string) {
  pageUrl = pageUrl.replace(protocol_re, '')
  pageUrl = pageUrl.replace('?', '|')
  return pageUrl
}

if (require.main === module) {
  main()
}
