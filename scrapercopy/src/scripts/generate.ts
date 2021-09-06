import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const scraper = () => `import Product from '../../entities/product'
import Scraper from '../../interfaces/scraper'
import screenPage from '../../utils/capture'

const scraper: Scraper = async (request, page) => {
  await page.goto(request.pageUrl)

  const products = [new Product('id', 'title', 'url')]

  const screenshot = await screenPage(page)

  return {
    screenshot,
    products,
  }
}

export default scraper
`

const provider = (name: string) => `export const name = '${name}'

export { default as scraper } from './scraper'
`

const run = async () => {
  const name = process.argv[2]
  if (!name) {
    throw new Error('Argument name is required')
  }

  await mkdir(join(__dirname, `../providers/${name}`))
  await writeFile(join(__dirname, `../providers/${name}/scraper.ts`), scraper())
  await writeFile(join(__dirname, `../providers/${name}/index.ts`), provider(name))

  console.log(`Provider ${name} created!`)
}

run()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
