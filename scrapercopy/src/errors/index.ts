import { IErrorReport } from '../interfaces/report'

export interface ErrorHandler<T extends string | Error> {
  (message: T, extra?: { screenshot?: string }): IErrorReport
}

export const notFound: ErrorHandler<string> = (message: string) => ({
  message,
  status: '404',
  error: new Error(message),
})
export const timeout: ErrorHandler<string> = (message: string) => ({
  message,
  status: '408',
  error: new Error(message),
})

export const unknownError: ErrorHandler<Error> = (error: Error, { screenshot } = {}) => ({
  message: error.message,
  status: '500',
  error,
  screenshot,
})
