import type { Page } from 'puppeteer'

export async function extractMetaTags(page: Page) {
  return page.$$eval('head > meta', metaTags => {
    const metaTagsCollection: { [key: string]: string }[] = []
    metaTags.forEach((metaTag: Element) => {
      const metaTagObj: { [key: string]: string } = {}
      const attributes = metaTag.getAttributeNames()
      attributes.forEach(attribute => {
        metaTagObj[attribute] = metaTag.getAttribute(attribute) || ''
      })
      metaTagsCollection.push(metaTagObj)
    })

    return metaTagsCollection
  })
}

export function mergeMetaTags(metaTags: any[]) {
  const ret: Record<string, string> = {}
  metaTags.forEach(t => {
    if (t?.property) {
      ret[t.property] = t.content
    } else {
      ret[t.name] = t.content
    }
  })
  return ret
}

export function getLdJsonScripts(page) {
  return page.$$eval('script[type="application/ld+json"]', scripts =>
    scripts.map(s => JSON.parse(s.innerHTML)),
  )
}
