// these dependencies are not included in package.json/dependencies due to being included in layer
import puppeteer from 'puppeteer'

import type { Browser } from 'puppeteer'
import { unknownError } from '../errors'
import IProvider from '../interfaces/provider'
import IReport from '../interfaces/report'
import IScrapeRequest from '../interfaces/request'
import { IRunner } from '../interfaces/runner'
import { v4 as uuidv4 } from 'uuid'

import screenPage from '../utils/capture'

const { HEADLESS = true, DEVTOOLS = false, BROWSER_ENDPOINT: browserWSEndpoint } = process.env

function getChromeArgs() {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process',
      '--disk-cache-size',
      `${1024 * 1024 * 128}`, // 128Mb ?
    ]
  } else if (process.env.RUNNING_IN_EKS) {
    // TODO: this is jank
    return ['--no-sandbox', '--disable-setuid-sandbox']
  } else {
    return []
  }
}

const getPuppeteer = async (): Promise<Browser> => {
  if (browserWSEndpoint) {
    // for some reason TS is reporting puppeteer-core types as different from puppeteer
    // even though the types.d.ts files are literally identical
    return puppeteer.connect({ browserWSEndpoint }) as unknown as Browser
  }
  const opts = {
    args: getChromeArgs(),
    headless: !!HEADLESS,
    devtools: !!DEVTOOLS,
  }
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.RUNNING_IN_EKS || process.env.USE_PROXY) {
    opts.args.push('--proxy-server=zproxy.lum-superproxy.io:22225')
  }
  console.log(`Running with options: ${JSON.stringify(opts)}`)
  return puppeteer.launch(opts)
}

// cache browser as singleton to prevent relaunching
let browserPromise: Promise<Browser> | undefined

const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = getPuppeteer()
    browserPromise.then(browser =>
      browser.on('disconnected', e => {
        // launch new browser if disconnected
        browserPromise = undefined
        getBrowser().catch(console.error)
        browser.close()
      }),
    )
  }
  return browserPromise
}

const puppeteerRunner: IRunner = async (
  provider: IProvider,
  request: IScrapeRequest,
): Promise<IReport> => {
  console.info(`🕑 [${provider.name}] Running provider...`)
  const reqId = uuidv4()
  console.log(`Using ${reqId} for X-RequestId`)

  const browser = await getBrowser()
  const page = await browser.newPage()

  // Clear cookies for a fresh session (incognito doesn't work for single-process)
  const client = await page.target().createCDPSession()
  await client.send('Network.clearBrowserCookies')
  await client.send('Network.clearBrowserCache')

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 (compatible: Remo/0.1; +https://www.remotasks.com/en/info.txt)',
  )
  await page.setExtraHTTPHeaders({
    'X-RequestId': reqId,
  })
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  })
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.USE_PROXY) {
    if (process.env.PROXY_PASSWORD) {
      const username =
        process.env.PROXY_USERNAME ?? 'lum-customer-c_b49b137c-zone-data_center-route_err-pass_dyn'
      console.log('using proxy username', username)
      await page.authenticate({
        username,
        password: process.env.PROXY_PASSWORD,
      })
      console.log('Authenticated via proxy')
    } else {
      throw new Error('Could not read PROXY_PASSWORD')
    }
  }

  try {
    return await provider.scraper(request, page)
  } catch (e) {
    console.error(e)
    let screenshot: string | undefined = undefined
    try {
      screenshot = await screenPage(page, { request })
    } catch (e) {
      console.warn(`Error capturing screenshot for ${request.pageUrl}`, e)
    }
    return unknownError(e as Error, { screenshot })
  } finally {
    try {
      await page.close()
    } catch (err) {
      if (err.message.match(/Most likely the page has been closed/)) {
        console.log('Ignoring potential race condition error')
      } else {
        throw err
      }
    }
  }
}

export default puppeteerRunner
