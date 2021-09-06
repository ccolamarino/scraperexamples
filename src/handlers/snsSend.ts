import AWS from 'aws-sdk'

const snsClient = new AWS.SNS()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendSnsMessage = async (msgObj: any, topicUrl: string) => {
  const snsMsg: AWS.SNS.PublishInput = {
    Message: JSON.stringify(msgObj),
    TopicArn: topicUrl,
    MessageAttributes: {
      lambdaFunctionName: {
        DataType: 'String',
        StringValue: process.env.AWS_LAMBDA_FUNCTION_NAME ?? 'none',
      },
      lambdaFunctionValue: {
        DataType: 'String',
        StringValue: process.env.AWS_LAMBDA_FUNCTION_VALUE ?? 'none',
      },
    },
  }
  return snsClient.publish(snsMsg)
}
