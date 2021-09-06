// Copied from @scale/scraper-orchestrator/src/sites/site.schema to accelerate docker build speed
export enum CrawlEngine {
  ScaleCrawler = 'scale_crawler',
  WebScraperIO = 'webscraper.io',
}

export default interface IScrapeRequest {
  pageUrl: string
  extractors: string[]

  scheduleTime: Date

  httpOptions?: {
    proxyConfig?: any
    customerUserAgent?: string
    additionalHeaders?: Record<string, string>
  }

  crawlEngine?: CrawlEngine
}
