import { DESCRIPTION_PLACEMENT } from '../../interfaces/outputProduct'
import { extractMetaTags, mergeMetaTags } from '../../utils/extractors'
import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'

async function getVariantId(page) {
  return await page.$eval('.product-add-to-cart input[name="pid"]', x => x.getAttribute('value')!)
}
function getGroupId(page) {
  return page.$eval('.product-add-to-cart input[name="pid_master"]', x => x.getAttribute('value')!)
}
async function setProductImages(page, product: Product) {
  await page.waitForSelector('.zoomImg')
  await page.waitForTimeout(3000)
  await page.waitForFunction(() => {
    // @ts-ignore
    return Array.from(document.querySelectorAll('.zoomImg')).every(img => img.complete)
  })
  product.images = await page.$$eval('.zoomImg', imgs => imgs.map(img => img.getAttribute('src')!))
}

function getMainTitle(page) {
  return page.$eval('.pdp-brand-wrapper', e => e.textContent!)
}

function getSubtitle(page) {
  return page.$eval('.pdp-name-wrapper', e => e.textContent!)
}
async function addSections(product: Product, page) {
  product.addAdditionalSection({
    content: await page.$eval(
      '.product-description-wrapper > .product-info-accordion > div:nth-child(1)',
      e => e.outerHTML,
    ),
    description_placement: DESCRIPTION_PLACEMENT.ADJACENT,
    name: 'FEATURES',
  })

  const hasAdditionalFeatures = await page.evaluate(() => {
    return !!document.querySelector(
      '.product-description-wrapper > .product-info-accordion > div:nth-child(2)',
    )
  })
  if (hasAdditionalFeatures) {
    product.addAdditionalSection({
      content: await page.$eval(
        '.product-description-wrapper > .product-info-accordion > div:nth-child(2)',
        e => e.outerHTML,
      ),
      description_placement: DESCRIPTION_PLACEMENT.MAIN,
      name: 'DESCRIPTION',
    })
  }
}

async function setPrice(page, product: Product) {
  product.realPrice = parseInt(
    await page.$eval('span[itemprop="price"]', x => x.getAttribute('content')!),
  )
  const higherPrice = await page.evaluate(() => {
    const node = document.querySelector('.product-price > .price-standard')
    return node ? node.textContent?.replace('$', '') : null
  })
  if (higherPrice) {
    product.higherPrice = parseInt(higherPrice)
  }
}

function getBullets(page): string[] | PromiseLike<string[] | undefined> | undefined {
  return page.$eval('.bulletedList', list =>
    // @ts-ignore
    list.innerText.split('\n').map(x => x.trim()),
  )
}

function getBreadcrumbs(page): string[] | PromiseLike<string[] | undefined> | undefined {
  return page.$eval('.breadcrumb', x => x.innerText.split('\n'))
}

function getDescription(page): string | PromiseLike<string | undefined> | undefined {
  return page.$eval('.pdp-description-wrapper', e => e.textContent!.trim())
}

const scraper: Scraper = async (request, page) => {
  await page.goto(request.pageUrl, { timeout: 120000 })

  const shouldCloseAnnoyingModal = await page.evaluate(async () => {
    const node = document.querySelector('#popup-start')
    return node && window.getComputedStyle(node).getPropertyValue('display') !== 'none'
  })
  if (shouldCloseAnnoyingModal) {
    await page.click('#popup-start .close-button')
  }

  const screenshot = await screenPage(page)

  const metaTags = mergeMetaTags(await extractMetaTags(page))

  const colorOptions = await page.evaluate(() => {
    const lis = Array.from(document.querySelectorAll('.swatches.Color li > a'))

    return lis.map(li => ({
      url: li.getAttribute('href')!,
      title: li.getAttribute('title'),
      subtitle: li.getAttribute('data-event-action'),
      productId: li.getAttribute('data-masterid'),
      colorId: li.getAttribute('data-colorid'),
      // @ts-ignore
      color: li.innerText,
    }))
  })

  const products: Product[] = []

  for (const colorOption of colorOptions) {
    const { url, title, color, colorId } = colorOption

    const shouldClick = await page.evaluate(selection => {
      const node = document.querySelector('.product-variations .selected-value')!
      // @ts-ignore
      if (node && node.innerText === selection) return false
      return true
    }, title!)

    if (shouldClick) {
      await page.click(`a[data-colorid="${colorId}"]`)
      await page.waitForFunction(
        selection => {
          const node = document.querySelector('.product-variations .selected-value')!
          if (!node) return false
          // @ts-ignore
          return node.innerText.trim() === selection.trim()
        },
        {},
        title!,
      )
    }

    const id = await getVariantId(page)
    const groupId = await getGroupId(page)
    const subTitle = await getSubtitle(page)
    const mainTitle = await getMainTitle(page)

    const product = new Product(id, mainTitle, url)
    product.color = color!

    await setProductImages(page, product)

    product.description = await getDescription(page)
    product.currency = metaTags['product:price:currency']
    product.sku = id
    product.subTitle = subTitle

    await setPrice(page, product)
    product.availability = metaTags['og:availability'] === 'instock'
    product.itemGroupId = groupId
    // @ts-ignore
    product.breadcrumbs = await getBreadcrumbs(page)
    product.bullets = await getBullets(page)
    const keyValuesInBullets = Object.fromEntries(
      product.bullets?.filter(bullet => bullet.includes(':')).map(bullet => bullet.split(':')) ??
        [],
    )

    product.keyValuePairs = {...keyValuesInBullets, color: product.color}

    product.options = {'color': color!}

    await addSections(product, page)

    products.push(product)
  }
  if (colorOptions.length === 0) {
    const id = await page.$eval('meta[itemprop="bf:sku"]', x => x.getAttribute('content')!)
    const groupId = id
    const subTitle = await getSubtitle(page)
    const mainTitle = await getMainTitle(page)

    const product = new Product(id, mainTitle, page.url())

    await setProductImages(page, product)

    product.description = await getDescription(page)
    product.currency = metaTags['product:price:currency']
    product.sku = id
    product.subTitle = subTitle

    await setPrice(page, product)
    product.availability = metaTags['og:availability'] === 'instock'
    product.itemGroupId = groupId
    // @ts-ignore
    product.breadcrumbs = await getBreadcrumbs(page)
    product.bullets = await getBullets(page)
    product.brand = 'Kipling'

    const keyValuesInBullets = Object.fromEntries(
      product.bullets?.filter(bullet => bullet.includes(':')).map(bullet => bullet.split(':')) ??
        [],
    )

    product.keyValuePairs = {...keyValuesInBullets}

    await addSections(product, page)

    products.push(product)
  }

  return {
    screenshot,
    products,
  }
}

export default scraper
