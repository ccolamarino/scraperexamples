import axios from 'axios'
import * as providers from '../providers'
;(async () => {
  const username = process.env.ORCHESTRATOR_API_TOKEN!

  const providerNames = Object.keys(providers)
    .filter(x => x !== 'getProvider')
    .sort()

  const payload = providerNames.map(name => ({ name }))

  await axios.post('https://orchestrator.crawler.scale.com/ci/update-extractors', payload, {
    auth: { username, password: '' },
  })
})()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
