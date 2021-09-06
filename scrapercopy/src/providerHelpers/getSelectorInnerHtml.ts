import type { Page } from 'puppeteer'

export async function getSelectorInnerHtml(page: Page, selector: string) {
  return page.evaluate(selector => {
    const element = document.querySelector(selector)
    return element ? element.innerHTML?.trim() : null
  }, selector)
}
