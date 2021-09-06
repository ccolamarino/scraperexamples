// TODO: Migrate to AWS SDK v3
import AWS from 'aws-sdk'

const sqsClient = new AWS.SQS({ apiVersion: '2012-11-05' })

// TODO: Don't hardcode
const INPUT_QUEUE_URL = 'https://sqs.us-west-2.amazonaws.com/695567787164/scraper-input-queue'

export async function receiveMessage() {
  return await sqsClient
    .receiveMessage({
      MaxNumberOfMessages: 1,
      MessageAttributeNames: ['All'],
      QueueUrl: INPUT_QUEUE_URL,
      WaitTimeSeconds: 20,
    })
    .promise()
}

export async function deleteMessage(receiptHandle: string) {
  return await sqsClient
    .deleteMessage({ QueueUrl: INPUT_QUEUE_URL, ReceiptHandle: receiptHandle })
    .promise()
}
