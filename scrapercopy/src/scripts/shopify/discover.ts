import { readFile, appendFile } from 'fs/promises'
import { load, dump } from 'js-yaml'
import axios from 'axios'
import { join } from 'path'
import { exit } from 'process'
import { TShopifyProduct } from '../../providers/shopify/types'

interface IShopifyProductResponse {
  products: TShopifyProduct[]
}

async function run() {
  const { sites } = load(
    await readFile(join(__dirname, './sites.yaml'), { encoding: 'utf-8' }),
  ) as { sites: string[] }

  for await (const url of sites) {
    const provider = url
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .replace('store.', '')
      .replace('shop.', '')
      .replace('my.', '')
      .split('.')[0]

    const path = join(url, 'products.json')
    console.log(`running discovery for [${provider}] for url: ${path}`)

    const response = await axios.get<IShopifyProductResponse>(path, {
      params: { limit: '10000000' },
    })
    const { products = [] } = response.data
    const urls = products.map(({ handle }) => join(url, 'products', handle))
    await appendFile(join(__dirname, '../../../run/sites-output.yml'), dump({ [provider]: urls }))
  }

  return 0
}

run()
  .then(exit)
  .catch(e => {
    console.error(e)
    exit(1)
  })
