import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'
import { gap } from '../../utils/format'
import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'
import BaseJockeyProduct from './types'

declare const baseProduct: BaseJockeyProduct

const scraper: Scraper = async (request, page) => {
  await page.goto(request.pageUrl)

  await page.waitForFunction('baseProduct')
  const base = await page.evaluate(() => baseProduct)

  const sections = await page.$$eval('#pdp-details .sub', list =>
    list.map(e => [e.innerHTML, e.querySelector('b')?.textContent || '']),
  )

  const products = base.Variants.map(variant => {
    const product = new Product(
      variant.VariantId,
      base.DisplayName,
      `https://www.jockey.com/catalog/product/${base.UrlId}${variant.IsSale ? `?isSale=True` : ''}`,
    )
    product.itemGroupId = base.Id
    product.realPrice = variant.Price
    product.higherPrice = base.Price
    product.currency = 'USD'
    product.color = variant.Color.ColorName
    product.colorFamily = variant.Color.ColorNumber
    product.size = variant.Size
    product.availability = variant.InStock
    product.gender = base.Meta.department?.[0]
    product.matchableIds = [variant.VariantId]
    product.bullets = base.Bullets
    product.breadcrumbs = base.Breadcrumbs.map(bread => bread.Display)
    product.description = base.Description
    product.parentWebsiteUrl = 'https://www.jockey.com/'
    product.sizeChartUrls = base.SizeChartType
      ? [`https://www.jockey.com/api/cms/sizechart/${base.SizeChartType}`]
      : undefined
    product.brand = 'jockey'

    sections.forEach(([content, name], index) => {
      product.addAdditionalSection({
        name,
        content,
        description_placement:
          index === 0 ? DESCRIPTION_PLACEMENT.MAIN : DESCRIPTION_PLACEMENT.ADJACENT,
      })
    })

    product.images =
      base.Matrix?.[variant.Color.ColorNumber]?.map(
        type =>
          `https://static.jockeycdn.com/pi/J-${gap(6, base.Id)}-${
            variant.Color.ColorNumber
          }-${type}-1446.jpg`,
      ) || []
    return product
  })

  const screenshot = await screenPage(page)

  return {
    screenshot,
    products,
  }
}

export default scraper
