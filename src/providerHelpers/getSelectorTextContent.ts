import type { Page } from 'puppeteer'

export async function getSelectorTextContent(page: Page, selector: string) {
  return page.evaluate(selector => {
    return document.querySelector(selector)?.textContent?.trim() || ''
  }, selector)
}
