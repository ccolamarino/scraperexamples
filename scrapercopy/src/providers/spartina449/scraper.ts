/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Page } from 'puppeteer'
import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'
import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'
import _ from 'lodash'

async function getImageUrls(page: Page) {
  await page.waitForSelector('.fotorama__active img.fotorama__img')
  try {
    await page.waitForSelector('.fotorama__thumb img.fotorama__img')
  } catch (e) {
    //ignored
  }
  // full image urls are infered from the thumbnails
  const allImages = await page.$$eval('img.fotorama__img', images =>
    images.map(img => img.getAttribute('src')!),
  )
  const mainImageUrl = await page.$eval(
    '.fotorama__active img.fotorama__img',
    img => img.getAttribute('src')!,
  )
  const path = mainImageUrl.split('/')
  const basePath = path.slice(0, path.length - 1)

  const fullImages = allImages.map(url => {
    const path = url.split('/')
    const id = path[path.length - 1]
    return basePath.concat(id).join('/')
  })

  return _.uniq(fullImages)
}

const scraper: Scraper = async (request, page) => {
  await page.goto(request.pageUrl)

  await page.waitForFunction('localStorage.product_data_storage')
  const data = await page.evaluate(() => {
    const obj = JSON.parse(localStorage.product_data_storage)

    if (Object.keys(obj).length > 1) throw new Error('expected only one key')
    return Object.values(obj)[0] as any
  })
  const learnq = await page.$$eval('script', scripts => {
    for (const script of scripts) {
      const content = script.textContent!
      if (content.includes('var _learnq = window._learnq')) {
        const m = content.match(/\_learnq\.push\(\['track', 'Viewed Product', (\{.*\})/)
        if (m && m[1]) {
          return JSON.parse(m[1])
        }
      }
    }
    return null
  })

  const products: Product[] = []

  async function fillBasicProductInfo(product: Product) {
    product.realPrice = data.price_info.final_price
    product.higherPrice = data.price_info.regular_price
    product.currency = data.currency_code

    product.images = await getImageUrls(page)
    product.sku = learnq.SKU
    product.itemGroupId = learnq.SKU
    product.breadcrumbs = await page.$$eval('.breadcrumbs li.item a', elems =>
      elems.map(e => e.innerHTML),
    )
    product.description = ( // @ts-ignore
      await page.$eval('#product-short-description', match => match.innerText ?? '')
    ).trim()
    product.bullets = await page.$$eval('#product-description > ul li', lis => {
      return lis
        .filter(li => !li.innerHTML.includes('Style #'))
        .map(li => li.innerHTML.replaceAll('<strong>', '').replaceAll('</strong>', ''))
    })

    const hasSizeChart = await page.evaluate(() => {
      return !!document.querySelector('#size-guide-popup-wrapper')
    })
    if (hasSizeChart) {
      product.sizeChartHtml = await page.$eval('#size-guide-popup-wrapper', e => e.outerHTML)
    }
  }

  async function fillProductFromContent(product: Product) {
    product.availability = await page.$eval(
      '.product-info-stock-sku > .stock > span',
      e => e.innerHTML.trim() !== 'Out of stock',
    )

    product.addAdditionalSection({
      content: await page.$eval('#product-short-description', match => match.outerHTML),
      description_placement: DESCRIPTION_PLACEMENT.MAIN,
      name: 'DESCRIPTION',
    })
    product.addAdditionalSection({
      content: await page.$eval('.product.attribute.description', match => match.outerHTML),
      description_placement: DESCRIPTION_PLACEMENT.ADJACENT,
      name: 'DESCRIPTION',
    })
  }

  const colorIds = await page.$$eval('.swatch-attribute.color .swatch-option', options => {
    // @ts-ignore
    return options.map(o => o.id)
  })

  const sizeIds = await page.$$eval('.swatch-attribute.size .swatch-option', options => {
    // @ts-ignore
    return options.map(o => o.id)
  })

  for (const colorId of colorIds) {
    await page.click(`#${colorId}`)

    // @ts-ignore
    const cId = await page.$eval(`#${colorId}`, e => e.getAttribute('id')!)
    // @ts-ignore
    const cLabel = await page.$eval(`#${colorId}`, e => e.getAttribute('option-label')!)

    for (const sizeId of sizeIds) {
      // @ts-ignore
      const sId = await page.$eval(`#${sizeId}`, e => e.getAttribute('option-id')!)
      // @ts-ignore
      const sLabel = await page.$eval(`#${sizeId}`, e => e.getAttribute('option-label')!)

      const isDisabled = await page.evaluate(
        // @ts-ignore
        ssid => document.querySelector(`#${ssid}`)!.getAttribute('disabled') === 'disabled',
        sizeId,
      )
      const product = new Product(`${data.id}:${cId}:${sId}`, data.name, data.url)

      product.color = cLabel
      product.size = sLabel
      await fillBasicProductInfo(product)

      if (isDisabled) {
        product.availability = false
        products.push(product)
        continue
      }

      await page.click(`#${sizeId}`)

      await fillProductFromContent(product)

      products.push(product)
    }

    // there's no size variants
    if (sizeIds.length === 0) {
      const product = new Product(`${data.id}:${cId}`, data.name, data.url)
      product.color = cLabel
      await fillBasicProductInfo(product)
      await fillProductFromContent(product)
      products.push(product)
    }

    // uncheck color to unblock other possible options
    await page.click(`#${colorId}`)
  }

  // there's no color variants
  if (colorIds.length === 0) {
    const product = new Product(`${data.id}`, data.name, data.url)
    await fillBasicProductInfo(product)
    await fillProductFromContent(product)
    products.push(product)
  }

  const screenshot = await screenPage(page)

  await page.evaluate(() => localStorage.removeItem('product_data_storage'))

  return {
    screenshot,
    products,
  }
}

export default scraper
