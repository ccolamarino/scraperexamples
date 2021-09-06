import type { Page } from 'puppeteer'

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(resolve => {
      let totalHeight = 0
      const distance = 400
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 75)
    })
  })
}
