import type { Page } from 'puppeteer'
import type IScrapeRequest from '../interfaces/request'
import { getS3Client, s3KeyForRequest } from '../service/s3'

const { AWS_LAMBDA_FUNCTION_NAME, SUPPRESS_OUTPUT, USE_S3 } = process.env
const SEND_TO_S3 = !!USE_S3 || (!!AWS_LAMBDA_FUNCTION_NAME && !SUPPRESS_OUTPUT)

export default async function screenPage(
  page: Page,
  { request }: { request?: IScrapeRequest } = {},
): Promise<string> {
  if (SEND_TO_S3 && request) {
    const screenshot = await page.screenshot({ fullPage: true })
    if (!screenshot) {
      return ''
    }
    const s3ObjectKey = `${s3KeyForRequest(request)}.png`
    await getS3Client()
      .upload({
        Bucket: 'scale-scraper-screenshots-us-west-2',
        Key: s3ObjectKey,
        Body: screenshot,
      })
      .promise()
    return s3ObjectKey
  }
  return ''
}
