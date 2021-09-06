import type { Page } from 'puppeteer'
import { IProductReport } from './report'
import IScrapeRequest from './request'

export default interface IScraper {
  (request: IScrapeRequest, page: Page): Promise<IProductReport>
}

export interface IScraperConstructor<TCallbacks, TConfig = Record<string, unknown>> {
  (callbacks: TCallbacks, config: TConfig): IScraper
}
