import type { Page } from 'puppeteer'

export async function getSelectorInnerText(page: Page, selector: string) {
  return page.evaluate(selector => {
    return document.querySelector(selector).innerText
  }, selector)
}
