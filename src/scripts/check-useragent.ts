import axios, { AxiosError } from 'axios'
import { appendFile, readFile } from 'fs/promises'
import { join } from 'path'
import { exit } from 'process'

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko; compatible; remobot/1.0; +http://remotasks.com/en/bots.txt) Chrome/91.0.4472.114 Safari/537.36',
}

const crawl = async (link: string) => {
  try {
    const response = await axios.get(link.trim(), { headers })
    return response.status
  } catch (error) {
    return (error as AxiosError).response?.status || 500
  }
}

const run = async () => {
  const file = await readFile(join(__dirname, '../../run/urls.csv'), 'utf-8')
  const [_, ...urls] = file.split(/\r\n/)
  await appendFile(
    join(__dirname, '../../run/check-user-agent-output.csv'),
    `rank,link,site,status\n`,
  )
  for await (const url of urls) {
    const [rank, link, site] = url.split(',')
    const status = await crawl(link)
    console.log(`[${site}] returned ${status}`)
    await appendFile(
      join(__dirname, '../../run/check-user-agent-output.csv'),
      `${rank},${link},${site},${status}\n`,
    )
  }
}

run()
  .then(() => exit(0))
  .catch(e => {
    console.error(e)
    exit(1)
  })
