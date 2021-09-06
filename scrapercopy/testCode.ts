import * as data from './run/_4ocean-2021-08-08_01-05.54-batch1.json'
import { extractBullets, htmlToTextArray } from './src/providerHelpers/parseHtmlTextContent'

const descriptionStructured = data[0][0].description_structured

const bullets = descriptionStructured.sections
  .map(section => extractBullets(section.content))
  .flat()

const text = descriptionStructured.sections.map(section => htmlToTextArray(section.content))

console.log('bullets', bullets)

console.log('htmlToTextArray', text)
