import { S3ObjectKey } from '../entities/product'
import IOutputProduct from './outputProduct'
import IReport from './report'

export default interface IScrapeResponse {
  /**
   * @description Request's page URL
   */
  pageUrl: string

  /**
   * @description Request's scheduled time
   */
  scheduleTime: Date

  /**
   * @description All URL changes that were covered during a session and record
   */
  extraUrls: string[]

  /**
   * @description Time where the request finished being processed
   */
  timestamp: Date

  /**
   * @description HTTP Status Code for the page load
   */
  httpStatusCode?: number

  /**
   * @description Timestamp when lambda received message
   */
  crawlStartTime: Date

  /**
   * @description  If available, amount of time to download initial HTML
   */
  initialPageLoadTime?: Date

  /**
   * @description Timestamp when lambda loaded page
   */
  pageLoadStartTime?: Date

  /**
   * @description Amount of time to load and render full page
   */
  fullPageLoadTime?: Date

  /**
   * @description Each extractor's result
   */
  extractorResults: IReport<IOutputProduct | S3ObjectKey>[]

  /**
   * @description Extractor version that was run
   */
  extractorVersion?: string
}
