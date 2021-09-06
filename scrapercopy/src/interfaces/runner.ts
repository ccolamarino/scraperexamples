import Product from '../entities/product'
import IProvider from './provider'
import IReport from './report'
import IScrapeRequest from './request'

export interface IRunner {
  (provider: IProvider, request: IScrapeRequest): Promise<IReport<Product>>
}
