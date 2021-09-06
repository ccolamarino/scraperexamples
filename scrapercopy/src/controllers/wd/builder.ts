/* eslint-disable @typescript-eslint/ban-ts-comment */
import Product from '../../entities/product'
import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'
import { htmlToTextArray } from '../../providerHelpers/parseHtmlTextContent'
import { IScraperConstructor } from '../../interfaces/scraper'
import { ProductCatalog, ProductPrices, WDDataSet } from './types'

declare const productCatalog: ProductCatalog
declare const productPrices: ProductPrices

const wdBuilder: IScraperConstructor<void, void> = () => async (request, page) => {
  page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36',
  )
  await page.goto(request.pageUrl)
  await page.waitForSelector('select[name=sku] option')

  const datasets = await page.$$eval('select[name=sku] option', options =>
    (options as HTMLOptionElement[]).map(option => ({
      ...(option.dataset as WDDataSet),
      id: option.value,
    })),
  )
  const catalog = await page.evaluate(() => productCatalog)
  const prices = await page.evaluate(() => productPrices)
  const currency = await page.$eval(
    '.open-currency-selection-modal span',
    span => (span as HTMLSpanElement).textContent?.split('(')[1].split(')')[0] || 'USD',
  )

  const breadcrumbs = await page.$$eval('.breadcrumbs li a', items =>
    (items as HTMLAnchorElement[]).map(i => i?.innerText.trim()),
  )

  const sections: [string, string][] = await page.$$eval(
    '.product-page-add-to-bag__container .accordion',
    accordions =>
      accordions.map(accordion => [
        //@ts-ignored
        accordion.querySelector('.heading')?.innerText || '',
        accordion.querySelector('.accordion-panel-content')?.innerHTML || '',
      ]),
  )

  const products = datasets
    .filter(ds => !!ds.id)
    .map(dataset => {
      const price = Object.entries(prices)
        .map(i => i[1])
        .map(({ items, productId }) => ({ item: items?.[dataset.id], productId }))
        .find(i => !!i.item)
      const base = catalog?.[price?.productId]
      const product = new Product(dataset.id, base.name, request.pageUrl)
      product.subTitle = base.shortDesc.replace(/<[^>]*>?/gm, ' ').replace(/\s+/gm, ' ')
      product.description = base.longDesc.replace(/<[^>]*>?/gm, '').replace(/\s+/gm, ' ')
      product.realPrice = price?.item.offerPrice || price?.item.listPrice
      product.higherPrice = price?.item.listPrice
      product.currency = currency || 'USD'
      product.availability = dataset.inventoryStatus?.toLowerCase() === 'available'
      product.brand = base.productAttrs.brand
      product.color = dataset.swatchColorFamily
      product.colorFamily = base.productId
      product.size = dataset.sizePrimary
      product.sku = dataset.longSku
      product.gender = base.productAttrs?.gender

      sections.forEach(([name, content]) => {
        product.addAdditionalSection({
          name,
          content,
          description_placement: name.toLowerCase().includes('details')
            ? DESCRIPTION_PLACEMENT.MAIN
            : DESCRIPTION_PLACEMENT.ADJACENT,
        })
      })

      product.bullets = product.additionalSections
        .flatMap(({ content }) => htmlToTextArray(content))
        .map(bullet => bullet.replace(/\W/gm, ' ').replace(/\s+/gm, ' '))

      product.keyValuePairs = product.bullets
        .map(bullet => bullet.split(':'))
        .filter(pairs => pairs.length === 2)
        .map(([key, value]) => ({
          [key.replace(/\W/gi, ' ').replace(/\s+/gi, ' ').trim().toLowerCase()]: value
            .split(',')
            .map(e => e.trim())
            .join(', '),
        }))
        .reduce((obj, cur) => ({ ...obj, ...cur }), {})

      product.matchableIds = [product.id]
      product.itemGroupId = base.collection
      product.breadcrumbs = breadcrumbs
      product.images = Object.values(base.imageSets)
        .filter(type => Array.isArray(type))
        .flat<any>()
        .filter(item => !!item?.imageId)
        .map(image => (image.src as string) || '')
        .filter(image => !!image)

      return product
    })

  const screenshot = ''

  // clear cookies & cache to prevent access denied
  const client = await page.target().createCDPSession()
  await client.send('Network.clearBrowserCookies')
  await client.send('Network.clearBrowserCache')

  return {
    screenshot,
    products,
  }
}

export default wdBuilder
