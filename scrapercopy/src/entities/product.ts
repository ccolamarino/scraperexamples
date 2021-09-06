/* eslint-disable lines-between-class-members */
import IOutputProduct, { IDescriptionSection, TProductMetadata } from '../interfaces/outputProduct'

export class S3ObjectKey {
  constructor(s3ObjectKey: string) {
    this.s3ObjectKey = s3ObjectKey
  }
  s3ObjectKey: string
}

export default class Product {
  id: string
  title: string
  subTitle?: string
  url: string
  metadata: TProductMetadata = {}
  images: string[] = []
  videos: string[] = []
  description?: string
  additionalSections: IDescriptionSection[] = []
  currency?: string
  sku?: string
  brand?: string
  subBrand?: string
  size?: string
  realPrice?: number
  higherPrice?: number
  availability?: boolean
  itemGroupId?: string
  color?: string
  options?: { [key: string]: string }
  gender?: string
  breadcrumbs?: string[]
  colorFamily?: string
  parentWebsiteUrl?: string
  ageGroup?: string
  bullets?: string[]
  keyValuePairs?: { [key: string]: string }
  sizeChartHtml?: string
  sizeChartUrls?: string[]
  sizeChartTitles?: string[]
  sizeChartData?: string[]
  matchableIds?: string[]
  fbPixelContentId?: string
  fbPixelContentType?: string

  constructor(id: string, title: string, url: string) {
    this.id = id
    this.title = title
    this.url = url
  }

  /**
   * Adds a new additional section to the product
   * @param section TAdditionalSection
   */
  addAdditionalSection(section: IDescriptionSection) {
    if (this.additionalSections && Array.isArray(this.additionalSections)) {
      this.additionalSections.push(section)
    }
  }

  /**
   * Adds a new additional sections to the product
   * @param sections TAdditionalSection[]
   */
  addAdditionalSections(sections: IDescriptionSection[]) {
    sections.forEach(section => this.addAdditionalSection(section))
  }

  clone(): Product {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }

  toJson(): IOutputProduct {
    return {
      id: this.id,
      title: this.title,
      link: this.url,
      sku: this.sku,
      image_links: this.images,
      videos: this.videos,
      description: this.description,
      currency: this.currency,
      brand: this.brand,
      sub_brand: this.subBrand,
      size: this.size,
      real_price: this.realPrice,
      higher_price: this.higherPrice,
      availability: this.availability,
      item_group_id: this.itemGroupId,
      display_color: this.color,
      options: this.options,
      gender: this.gender,
      breadcrumbs: this.breadcrumbs?.join(' > '),
      color_family: this.colorFamily,
      parent_website_url: this.parentWebsiteUrl,
      age_group: this.ageGroup,
      bullets: this.bullets,
      key_value_pairs: Object.entries(this.keyValuePairs || {}).map(([key, value]) => ({
        key,
        value,
      })),
      description_structured: { sections: this.additionalSections },
      size_chart_html: this.sizeChartHtml,
      size_chart_links: this.sizeChartUrls?.join('\n'),
      size_chart_titles: this.sizeChartTitles?.join('\n'),
      size_chart_data: this.sizeChartData,
      variant_matchable_id: this.matchableIds?.join('\n'),
      fb_pixel_content_id: this.fbPixelContentId,
      fb_pixel_content_type: this.fbPixelContentType,
    }
  }
}
