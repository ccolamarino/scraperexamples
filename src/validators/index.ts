import IReport from '../interfaces/report'

export type ValidationSuccess = []
export class ValidationError extends Error {
  path?: string

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export type ValidatorResult = ValidationSuccess | ValidationError

export interface Validator {
  (report: IReport): Promise<ValidatorResult>
}

export type Validators = Validator[]
