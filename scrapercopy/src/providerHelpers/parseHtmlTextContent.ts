import _ from 'lodash'
import { convert } from 'html-to-text'

/**
 * This fn takes an HTML and returns an array with all the lines converted to text, according to
 * html-to-text module.
 * In the future, we'll change this to improve bullets detection.
 * @param html - String with HTML to parse to text
 * @returns
 */
export function htmlToTextArray(html: string) {
  return (
    convert(html, {
      wordwrap: null,
      // baseElements: {
      //   selectors: ['ul', 'ol'],
      // },
    })
      .split('\n')
      .map(e => e.trim())
      // .filter(e => e && e.match(/^\* /m))
      .filter(e => e !== '')
      .map(e =>
        e
          .replace(/^\* /, '')
          .replace(/\s\s/g, ' ')
          .replace(/\s+:(.)/, ':$1')
          .replace(/(.):(\S)/, '$1: $2'),
      )
  )
}

/**
 *
 * @param htmlText
 * @ param opts
 * @ param opts.lineFilterFuncs
 * @ param opts.flatten
 * @returns {*}
 */
export default extractText

export function extractText(htmlText: string) {
  // // parse out html tags that contain textContent that is embedded src code or css
  // htmlText = htmlText.replace(/<head[\s\S]*?>[\s\S]*?<\/head>/gi, '')
  // htmlText = htmlText.replace(/<(?:no)?script>[\s\S]*?<\/(?:no)?script>/g, '')
  // htmlText = htmlText.replace(/<style.*?>[\s\S]*?<\/style>/g, '')
  // htmlText = htmlText.replace(/<[\s\S]*?>/g, ' ')

  // // parse out bulky whitespace chars
  // htmlText = filterOutBulkyWhitespace(htmlText)
  // htmlText = decode(htmlText) // some entities are whitespace chars
  // htmlText = filterOutBulkyWhitespace(htmlText)

  // return htmlText
  return (
    convert(htmlText, {
      wordwrap: null,
      // baseElements: {
      //   selectors: ['ul', 'ol'],
      // },
    })
      .split('\n')
      .map(e => e.trim())
      // .filter(e => e && e.match(/^\* /m))
      .filter(e => e !== '')
      .join('\n')
  )
}

export function extractBullets(htmlText: string): string[] {
  return textToBullets(extractText(htmlText))
}

export function textToBullets(text: string): string[] {
  // Split text by new lines
  const lines = text.split('\n')

  let previousLine: string = lines[0]
  const cleanLines: string[] = [previousLine]

  for (const line of lines.slice(1)) {
    if (isSectionHeader(previousLine)) {
      // Rule #1 - If the previous line was a section header, then the current line should be combined with it
      // TODO @ngahlot - is there a better way to use changing tags to pick up more lines in the section header. so far , not that I can tell
      const newLine = filterOutBulkyWhitespace(`${previousLine} ${line}`)
      cleanLines.pop()
      cleanLines.push(newLine)
    } else {
      cleanLines.push(line)
    }
    previousLine = line
  }

  return _.filter(cleanLines, line => !_.isEmpty(line))
}

const isSectionHeader = (text: string) => {
  // <strong> / <b> is not a good delimeter
  // line ending in colon looks good
  // all capital line looks good
  return text.trim().endsWith(':') || text === text.toUpperCase()
}

// helper extract text between tags via regex bc faster (though it is ugly)
export const extractTags = (htmlText: string, tag: string): string[] => {
  const regexp = new RegExp(`<${tag}[^>]*>((.|\n)*?)</${tag}>`, 'g')
  const matches: string[] = Array.from(htmlText.matchAll(regexp), m => m[0])
  return _.compact(_.map(matches, match => filterOutHTMLTags(match).trim()))
}

// helper to remove all html tags via regex bc faster (though it is ugly)
function filterOutHTMLTags(htmlText: string): string {
  return htmlText.replace(/<.*?>/g, '')
}

function filterOutBulkyWhitespace(htmlText: string) {
  htmlText = htmlText.replace(/\n{2,}/g, '\n')
  htmlText = htmlText.replace(/ {2,}/g, ' ')
  htmlText = htmlText.replace(/\s{2,}/g, '\n')

  return htmlText.trim()
}
