/* eslint-disable camelcase */
export interface TProductMetadata {
  [key: string]: any
}

export interface TKeyValuePair {
  key: string
  value: string
}

export enum DESCRIPTION_PLACEMENT {
  MAIN = 'MAIN_DESCRIPTION',
  ADJACENT = 'ADJACENT_DESCRIPTION',
  DISTANT = 'DISTANT_DESCRIPTION',
}

export interface IDescriptionSection {
  name: string
  content: string
  description_placement: DESCRIPTION_PLACEMENT
}

export interface IDescriptionStructured {
  sections: IDescriptionSection[]
}

export default interface IOutputProduct {
  id: string
  title: string
  link: string
  metadata?: TProductMetadata
  brand?: string
  sku?: string
  sub_brand?: string
  image_links?: string[]
  size?: string
  real_price?: number
  higher_price?: number
  availability?: boolean
  item_group_id?: string
  description?: string
  currency?: string
  display_color?: string
  videos?: string[]
  description_structured?: { sections: IDescriptionSection[] }
  options?: { [key: string]: string }
  gender?: string
  breadcrumbs?: string
  fb_pixel_content_id?: string
  fb_pixel_content_type?: string
  color_family?: string
  parent_website_url?: string
  age_group?: string
  /**
   * @description newline separated value
   */
  bullets?: string[]
  key_value_pairs?: TKeyValuePair[]
  size_chart_html?: string
  /**
   * @description newline separated value
   */
  size_chart_links?: string
  /**
   * @description newline separated value
   */
  size_chart_titles?: string
  size_chart_data?: any
  variant_matchable_id?: string
  product_group_matchable_id?: string
}
