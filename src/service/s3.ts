import AWS, { S3 } from 'aws-sdk'
import type IScrapeRequest from '../interfaces/request'

let s3Client: S3 | undefined

export function getS3Client() {
  if (!s3Client) {
    s3Client = new AWS.S3()
  }
  return s3Client
}

export function s3KeyForRequest(request: IScrapeRequest) {
  return `${sanitizeUrl(request.pageUrl)}/${request.scheduleTime || new Date().toISOString()}`
}

const protocol_re = /https?:\/\//

function sanitizeUrl(pageUrl: string) {
  pageUrl = pageUrl.replace(protocol_re, '')
  pageUrl = pageUrl.replace('?', '|')
  return pageUrl
}
