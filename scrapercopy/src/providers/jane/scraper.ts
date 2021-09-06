/* eslint-disable no-param-reassign */
import type { Page } from 'puppeteer'
import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'
import Product from '../../entities/product'
import IScraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'
import { extractMetaTags } from '../../utils/extractors'
import { DEBUGGER_OPTIONS } from '../../utils/page'
import JaneResponse, { getProductOptionValue, JaneProductOptionValue } from './response'

const idRegex = /\/(\d+)\//

const getId = (url: string) => (url.match(idRegex) || [])[1]

const getResposne = (page: Page, id: string, timeout = 30000) =>
  new Promise<JaneResponse>((res, rej) => {
    page.on('response', response => {
      if (response.url().endsWith(id)) {
        res(response.json())
      }
    })
    setTimeout(() => rej(new Error('Timeout waiting for response')), timeout)
  })

interface Reducer {
  (product: Product, option: JaneProductOptionValue): Product
}
interface Reducers {
  default: Reducer
  [name: string]: Reducer
}
const reducers: Reducers = {
  Color(product, { valueText, imageUrl, additionalPrice }) {
    product.color = valueText
    product.realPrice = (product.realPrice || 0) + (additionalPrice || 0)
    if (imageUrl) {
      product.images.push(imageUrl)
    }
    return product
  },
  Size(product, { valueText, imageUrl, additionalPrice }) {
    product.size = valueText
    product.realPrice = (product.realPrice || 0) + (additionalPrice || 0)
    if (imageUrl) {
      product.images.push(imageUrl)
    }
    return product
  },
  default(product, { imageUrl, additionalPrice }) {
    product.realPrice = (product.realPrice || 0) + (additionalPrice || 0)
    if (imageUrl) {
      product.images.push(imageUrl)
    }
    return product
  },
}

const scraper: IScraper = async (request, page) => {
  const id = getId(request.pageUrl)
  const gotoPromise = page.goto(request.pageUrl, DEBUGGER_OPTIONS)
  const response = await getResposne(page, id)

  const metaTags = await extractMetaTags(page)

  const description = await page.$eval('#dealDetails div p:nth-child(1)', e => e.textContent)
  const bullets = await page.$$eval('#dealDetails div li', li => li.map(e => e.textContent))
  const sections = await page.$$eval('#dealDetails > div > div', elements =>
    elements.map(e => [
      e.querySelector('h2, h3')?.textContent || '',
      e?.innerHTML || '',
    ]).filter(item => !['FINE PRINT', 'SELLER', 'SHIPPING'].includes(String(item[0]).toUpperCase())),
  )

  const products = response.variants
    .filter(variant => variant.optionValues?.length)
    .map(variant => {
      const product = new Product(id, response.title, response.url)
      product.realPrice = response.price
      product.higherPrice = response.retail
      product.images = [
        ...new Set([response.mainImageUrl || '', ...(response.images?.map(i => i.url) || [])]),
      ].filter(i => !!i)
      product.description = description || undefined
      product.bullets = bullets.filter(li => li) as string[]
      product.metadata = { response, metaTags, price: response.price }
      product.brand = response.sellerName
      product.itemGroupId = id
      product.availability = variant.quantity > (variant.soldQuantity || 0)

      variant.optionValues
        .map(option => getProductOptionValue(response, option))
        .reduce(
          (newProduct, option) =>
            (reducers[option.name.replace('(See Description)', '').trim() || ''] || reducers.default)(newProduct, option),
          product,
        )

      product.options = {
        size: product.size,
        color: product.color
      } as any

      sections.forEach(([name, content], index) => {
        product.addAdditionalSection({
          name,
          content,
          description_placement:
            index === 0 ? DESCRIPTION_PLACEMENT.MAIN : DESCRIPTION_PLACEMENT.ADJACENT,
        })
      })

      return product
    })

  const screenshot = await screenPage(page)

  // Await this to avoid a "Browser disconnected" error later down the line
  await gotoPromise

  return {
    screenshot,
    products,
  }
}

export default scraper
