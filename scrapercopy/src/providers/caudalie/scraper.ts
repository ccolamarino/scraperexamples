import type { Page } from 'puppeteer'
import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'
import _ from 'lodash'
import { extractMetaTags, mergeMetaTags } from '../../utils/extractors'
import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'

const scraper: Scraper = async (request, page) => {
  await page.goto(request.pageUrl, { waitUntil: 'domcontentloaded' })
  // TODO: without this, the images are not loaded and we cannot get the full size ones - should find a better way
  await page.waitForTimeout(5000)
  const metaTags = mergeMetaTags(await extractMetaTags(page))

  const data = await page.evaluate(() => {
    const products = (window as any).dataLayer.find((a: any) => a.ecommerce).ecommerce.detail
      .products
    if (Array.isArray(products)) {
      if (products.length > 1) throw new Error('expected only one product')
      return products[0]
    }
    return products
  })

  await page.waitForFunction('localStorage.product_data_storage')
  const data2 = await page.evaluate(() => {
    const obj = JSON.parse(localStorage.product_data_storage)
    if (Object.keys(obj).length > 1) throw new Error('expected only one key')
    return Object.values(obj)[0] as any
  })

  const product = new Product(data.id, data.name, request.pageUrl)

  const imgUrls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[data-gallery-role="gallery"] img')).map(img =>
      img.getAttribute('src'),
    )
  })
  // @ts-ignored
  const imgBaseId = imgUrls[0]?.match(/[a-z0-9]{32}/)[0]
  const images = Array.from(
    new Set(
      imgUrls.map(x => {
        if (x) {
          const [a, b] = x.split(/[a-z0-9]{32}/)
          return `${a}${imgBaseId}${b}`
        } else {
          return ''
        }
      }),
    ),
  )

  const video = await page.evaluate(() =>
    document.querySelector('.how-to-use-wrapper iframe')?.getAttribute('src'),
  )

  const bullets = await page.$$eval('div.main-description-wrapper ul li', lis =>
    lis.map(li => li.textContent ?? ''),
  )

  bullets.push(
    ...((await page.evaluate(() =>
      document
        .querySelector('div.how-to-use-wrapper')
        ?.textContent?.split('\n')
        .map(x => x.trim())
        .filter(x => x.charAt(0) === '-'),
    )) || []),
  )

  bullets.push(
    ...(await page.evaluate(() =>
      Array.from(document.querySelectorAll('div.cms-content-important p'))
        .map(
          x =>
            x?.textContent
              ?.split('\n')
              .map(x => x.trim())
              .filter(x => x.charAt(0) === '-') || '',
        )
        .flat(),
    )),
  )

  // Remove this so it's not included in the description section
  await page.evaluate(() => {
    document.querySelector('div.composition-wrapper')?.remove()
  })

  product.availability = data2.is_salable === '1'
  product.sku = product.id
  product.realPrice = data2.price_info.final_price
  product.higherPrice = data2.price_info.regular_price
  product.currency = data2.currency_code
  product.size = await page.$eval('.contenance_size span', e => e.textContent?.trim() ?? '')
  product.images = images
  if (video) product.videos = [video]
  product.brand = data.brand
  product.description = await getDescription(page)
  product.keyValuePairs = { size: product.size }
  product.bullets = bullets
  product.addAdditionalSection({
    name: 'DESCRIPTION',
    content: await page.$eval('div.main-description-wrapper', e =>
      e.outerHTML.replaceAll('\n', '').replaceAll('\t', '').trim(),
    ),
    description_placement: DESCRIPTION_PLACEMENT.MAIN,
  })
  product.addAdditionalSection({
    name: 'HOW TO USE',
    content: await page.$eval('div.how-to-use-wrapper', e =>
      e.outerHTML.replaceAll('\n', '').replaceAll('\t', '').trim(),
    ),
    description_placement: DESCRIPTION_PLACEMENT.DISTANT,
  })
  product.addAdditionalSection({
    name: 'INGREDIENTS',
    content: await page.$eval('div.product-ingredients-container', e =>
      e.outerHTML.replaceAll('\n', '').replaceAll('\t', '').trim(),
    ),
    description_placement: DESCRIPTION_PLACEMENT.DISTANT,
  })

  product.metadata = { metaTags }

  await page.evaluate(() => localStorage.removeItem('product_data_storage'))

  return {
    screenshot: await screenPage(page),
    products: [product],
  }
}

const getDescription = async (page: Page) => {
  return await page.evaluate(() => {
    // Type A - Multiple <p> elements
    const multiP = Array.from(
      document.querySelectorAll(
        'div.main-description-wrapper div[data-element="main"] div[data-element="main"] > p',
      ),
    ).map(p => p.textContent?.trim())
    if (multiP.length) {
      return multiP.join(' ')
    }

    // Type B - Chunk of text inside div
    const chunkDiv = document
      .querySelector(
        'div.main-description-wrapper div[data-element="main"] div[data-element="main"]',
      )
      ?.textContent?.replaceAll('\n', '')
      .trim()
    if (chunkDiv) {
      return chunkDiv
    }

    // Type C - Wrapper with text
    const wrapper = document.querySelector('div.main-description-wrapper')
    if (wrapper?.childNodes[0]?.nodeName === '#text') {
      return wrapper?.textContent?.split('Benefits')[0].replaceAll('\n', '').trim()
    }

    // Type D - Wrapper with <p>
    return Array.from(document.querySelectorAll('div.main-description-wrapper > p'))
      .map(p => p.textContent?.replaceAll('\n', '').trim())
      .join(' ')
  })
}

export default scraper
