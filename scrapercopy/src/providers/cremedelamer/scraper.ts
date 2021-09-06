import { join } from 'path'
import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'
import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'
import LaMerProduct from './types'

declare const inv_product: LaMerProduct

const HOST = 'https://www.cremedelamer.com/'

const scraper: Scraper = async (request, page) => {
  await page.goto(request.pageUrl)

  await page.waitForFunction('!!inv_product')
  const data = await page.evaluate(() => inv_product)

  const breadcrumbs = await page.$eval(
    '.product-breadcrumb',
    e =>
      e?.textContent
        ?.replace(/\n/gi, '')
        ?.split('/')
        ?.map(s => s.trim()) || [],
  )

  const description = await page.$eval(
    '.product-full__description .product-full__accordion__panel',
    e => (e as HTMLDivElement)?.innerText,
  )

  const details = await page.$eval(
    '.product-full__description .product-full__accordion__panel',
    e => e.innerHTML,
  )

  const ingredients = await page.$eval(
    '.product-full__ingredients .product-full__accordion__panel',
    e => e.innerHTML,
  )

  const use = await page.$eval(
    '.product-full__use .product-full__accordion__panel',
    e => e.innerHTML,
  )

  const selections = await page.$$eval('.block-nodeblock:nth-child(n+3) section', sections =>
    sections.map(section => [
      section.querySelector('header')?.innerText || '',
      section.outerHTML || '',
    ]),
  )

  const bullets = [
    ...(await page.$$eval('.product-full__ingredients .product-full__accordion__panel p', p =>
      p.map(e => e.textContent || ''),
    )),
  ]

  const videos = [
    ...new Set([
      ...(await page.$$eval('.video-block[data-youtube-id]', items =>
        (items as HTMLElement[]).map(i => i.dataset.youtubeId?.split('?')[0] || ''),
      )),
      ...(await page.$$eval('.product-full__media [data-youtube-id]', videos =>
        videos.map(video => (video as any)?.dataset?.youtubeId),
      )),
    ]),
  ]

  const products = data.skus.map(sku => {
    const link = join(HOST, data.url, '#/sku', sku.SKU_BASE_ID.toString())
      .replace('https:/', 'https://')
      .replace('http:/', 'http://')
    const product = new Product(sku.SKU_ID, data.PROD_RGN_NAME, link)

    product.subTitle = data.SHORT_DESC
    product.description =
      description || data.DESCRIPTION || data.META_DESCRIPTION || data.SHORT_DESC
    product.availability = !!sku.isShoppable
    product.brand = 'La Mer'
    product.color = sku.SHADENAME
    product.currency = 'USD'
    product.realPrice = sku.PRICE
    product.size = sku.PRODUCT_SIZE
    product.images = [...new Set([...sku.LARGE_ALT_IMAGES, ...sku.rs_sku_image])].map(link =>
      link.startsWith('http') ? link : `${HOST}${link}`.replace(`${HOST}/`, HOST),
    )
    product.videos = videos.map(link => `https://www.youtube.com/watch?v=${link}`)
    product.itemGroupId = sku.PARENT_CAT_ID
    product.matchableIds = [sku.path]
    product.parentWebsiteUrl = HOST
    product.sku = sku.SKU_BASE_ID.toString()
    product.breadcrumbs = breadcrumbs
    product.bullets = bullets

    product.addAdditionalSection({
      name: 'Details',
      content: details,
      description_placement: DESCRIPTION_PLACEMENT.MAIN,
    })

    product.addAdditionalSection({
      name: 'Ingredients',
      content: ingredients,
      description_placement: DESCRIPTION_PLACEMENT.ADJACENT,
    })

    product.addAdditionalSection({
      name: 'How to use',
      content: use,
      description_placement: DESCRIPTION_PLACEMENT.ADJACENT,
    })

    selections.forEach(([name, content]) => {
      product.addAdditionalSection({
        name,
        content,
        description_placement: DESCRIPTION_PLACEMENT.DISTANT,
      })
    })

    return product
  })

  const screenshot = await screenPage(page)

  return {
    screenshot,
    products,
  }
}

export default scraper
