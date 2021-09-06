import Product, { S3ObjectKey } from '../entities/product'
import IOutputProduct from './outputProduct'

export default interface IReport<T extends Product | IOutputProduct | S3ObjectKey = Product> {
  screenshot?: string
  products?: T[]

  status?: string
  message?: string
  stack?: string
  error?: Error
}

export interface IS3Report extends IReport<S3ObjectKey> {
  // This is stupid.
  products: S3ObjectKey[]
}

export interface IProductReport extends IReport<Product> {
  screenshot: string
  products: Product[]
}

export interface IErrorReport extends IReport<Product> {
  status: string
  message: string
}
