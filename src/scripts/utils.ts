import * as uuid from 'uuid'
import { Context, SQSEvent } from 'aws-lambda'

type massageMaker = (message: any, attributes?: { [name: string]: string }) => SQSEvent
export const makeMessage: massageMaker = (message, attributes = {}) => ({
  Records: [
    {
      messageId: uuid.v1(),
      body: JSON.stringify(message),
      attributes: {
        SentTimestamp: Date.now().toString(),
        ApproximateFirstReceiveTimestamp: Date.now().toString(),
        ApproximateReceiveCount: '1',
        SenderId: 'local',
      },
      receiptHandle: '',
      awsRegion: 'local',
      eventSource: 'local',
      eventSourceARN: '',
      md5OfBody: '',
      messageAttributes: Object.entries(attributes).reduce(
        (obj, [name, stringValue]) => ({
          ...obj,
          [name]: {
            binaryListValues: [],
            dataType: 'string',
            stringListValues: [],
            stringValue,
          },
        }),
        {},
      ),
    },
  ],
})

type ContextMaker = (extra?: any) => Context
export const makeContext: ContextMaker = (extra: any = {}) => ({
  functionName: 'local-scraper',
  functionVersion: '',
  callbackWaitsForEmptyEventLoop: true,
  invokedFunctionArn: '',
  memoryLimitInMB: '1',
  awsRequestId: '1',
  logGroupName: 'local',
  logStreamName: 'local',
  getRemainingTimeInMillis: () => 1,
  done: () => null,
  fail: () => null,
  succeed: () => null,
  ...extra,
})
