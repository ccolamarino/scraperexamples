import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'
import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'

const scraper: Scraper = async (request, page) => {
  const entryPage = request.pageUrl

  await page.goto(request.pageUrl, { waitUntil: 'domcontentloaded' })

  const breadcrumbBase = (
    await page.$$eval('.breadcrumb li', list =>
      list.map(li => li?.textContent?.trim() || '').filter(s => s),
    )
  ).slice(0, -1)

  const bullets = await page.$$eval('.desc li', list =>
    list.map(li => li?.textContent?.trim() || '').filter(s => s),
  )

  const iframeVideos = await page.evaluate(() => [
    ...new Set(
      // @ts-ignore
      Array.from(document.querySelectorAll('iframe[src*="vimeo"]')).map(v => v.src.split('?')[0]),
    ),
  ])

  await page.evaluate(() => {
    setInterval(() => window.scrollBy(0, window.innerHeight), 500)
  })

  await page.waitForSelector(
    '.img-fluid.lazy-seen.lazyloaded:not(.benefit-img):not(.product-carousel-img)',
  )

  const imagesFromSections = await page.$$eval(
    '.img-fluid.lazy-seen.lazyloaded:not(.benefit-img):not(.product-carousel-img)',
    imgs => imgs.map((img: any) => img.dataset.src),
  )

  console.log(imagesFromSections)

  let factsBullets = []
  if ((await page.$('.fact-container')) !== null) {
    // @ts-ignore
    factsBullets = await page.$$eval('.fact-container', items =>
      items.map(item => item.textContent?.trim().replace('\n\n\n', ' - ')),
    )
  }

  const benefitBullets = await page.$$eval('.benefits-label', el =>
    el.map((e: any) => e.textContent.trim()),
  )

  const accordionSections = (
    await page.$$eval('.desc', (divs: any) =>
      divs.map(div => ({
        name: div.querySelector('h2')?.textContent?.trim() || '',
        content: div.innerHTML || '',
      })),
    )
  )
    .filter(s => s.content)
    .map((section, i) => ({
      ...section,
      description_placement: i === 0 ? DESCRIPTION_PLACEMENT.MAIN : DESCRIPTION_PLACEMENT.ADJACENT,
    }))

  let sections = [accordionSections]

  if (await page.$('.benefits-container')) {
    const benefitsSection = await page.$eval('.benefits-container', benefits => ({
      title: 'Benefits',
      content: benefits.querySelector('.benefits-list')?.innerHTML,
    }))

    sections = [
      ...sections,
      { ...benefitsSection, description_placement: DESCRIPTION_PLACEMENT.ADJACENT },
    ]
  }

  if (await page.$('.pd-btm-section')) {
    const bottomSections = (
      await page.$$eval('.pd-btm-section .module-container', sections =>
        sections.map(section => ({
          title: section.querySelector('h2')?.textContent?.trim() || '',
          content: section.innerHTML,
        })),
      )
    )
      .filter(s => s.content)
      .filter(s => !s.title.toUpperCase().includes('F.A.Q.'))
      .filter(s => !s.title.toUpperCase().includes('RELATED CATEGORIES'))
      .filter(s => !s.title.toUpperCase().includes('COMPLETE YOUR ROUTINE'))
      .map(s => ({ ...s, description_placement: DESCRIPTION_PLACEMENT.DISTANT }))

    sections = [...sections, ...bottomSections]
  }

  // @ts-ignore
  const productMasterId = await page.evaluate(() => gtm_vars.product[0].productMasterId)
  const dataURL = `https://www.fresh.com/on/demandware.store/Sites-fresh-Site/en_US/Product-Variation?pid=${productMasterId}`
  const variantsData = await (await page.goto(dataURL)).json()

  let variantsURLs: string[]
  const variationAttributes = variantsData.product.variationAttributes

  if (variationAttributes === null) {
    variantsURLs = [dataURL]
  } else {
    variantsURLs = variationAttributes[0].values.map(({ selected, value, url }) => {
      if (!selected) return url
      // the selected variant needs one more param to be consistent with the rest
      const paramName = `dwvar_${productMasterId}_${variationAttributes[0].id}=`
      return url.replace(paramName, paramName + encodeURIComponent(value))
    })
  }

  const products: Product[] = []

  let vcounter = variantsURLs.length

  for (const url of variantsURLs) {
    vcounter -= 1
    console.log(' >', vcounter)

    const { product } = await (await page.goto(url)).json()

    const URL =
      variantsURLs.length === 1 ? entryPage : `https://www.fresh.com${product.selectedProductUrl}`

    // ugly fix
    await page.goto(URL)
    const description_main_content = await page.$eval('#shortDescription-body', e => e.outerHTML)

    sections = sections.flat()
    sections = sections
      .map((sec, i) =>
        i === 0
          ? {
              title: 'What it is',
              content: description_main_content,
              description_placement: DESCRIPTION_PLACEMENT.MAIN,
            }
          : sec,
      )
      .flat()

    const variant = new Product(product.id, product.productName, URL)

    const color =
      product.compareVariationAttributes
        ?.find(({ id }) => id === 'color')
        ?.values?.find(({ selected }) => selected)?.displayValue || ''

    let size
    if (variantsURLs.length === 1) {
      size = await page.evaluate(() =>
        //@ts-ignore
        Array.from(document.querySelectorAll('.attribute-values'))
          //@ts-ignore
          .find(item => item.textContent.includes('Size:'))
          ?.textContent.split('Size:')[1]
          .trim(),
      )
    } else {
      size =
        product.compareVariationAttributes
          ?.find(({ id }) => id === 'size')
          ?.values?.find(({ selected }) => selected)?.displayValue || ''
    }

    variant.title = product.productName
    variant.images = [...product.images.large.map(img => img.url), ...imagesFromSections]
    variant.videos = [
      ...new Set([
        // @ts-ignore
        ...(product.videos?.map(({ id }) => `https://player.vimeo.com/video/${id}`) ?? []),
        ...iframeVideos,
      ]),
    ]
    variant.currency = product.price.sales.currency
    variant.sku = product.id
    variant.brand = product.brand === '08' ? 'Fresh' : product.brand
    variant.realPrice = product.price.sales.value
    variant.higherPrice =
      +product?.giftSetDiscountMsg?.split('$')[1]?.split(')')[0] || product.price.sales.value
    variant.availability = product.availability.messages[0].toUpperCase() === 'IN STOCK'
    variant.description = product.shortDescription.replace(/<[^>]*>?/gm, '').replace(/\s+/gm, ' ')
    variant.breadcrumbs = [...breadcrumbBase, product.productName]
    variant.bullets = [...bullets, ...factsBullets, ...benefitBullets]
    if (color) {
      variant.color = color
      variant.size = product.standardSize ?? undefined
    }
    if (size) variant.size = size

    sections.map(section => variant.addAdditionalSection(section))

    products.push(variant)
  }

  const screenshot = await screenPage(page)

  return {
    screenshot,
    products,
  }
}

export default scraper
