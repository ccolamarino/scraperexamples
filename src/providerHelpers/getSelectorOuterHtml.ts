import type { Page } from 'puppeteer'

export async function getSelectorOuterHtml(page: Page, selector: string) {
  return page.evaluate(selector => {
    const element = document.querySelector(selector)
    return element ? element.outerHTML?.trim() : null
  }, selector)
}
