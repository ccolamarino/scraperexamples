export interface Meta {
  department: string[]
  collection: string[]
  category: string[]
  style: string[]
  fabrication: string[]
  marketing: string[]
  lining: any[]
  straps: any[]
  support: any[]
  coverage: any[]
}

export interface Matrix {
  [ColorName: string]: string[]
}

export interface Breadcrumb {
  Url: string
  Display: string
}

export interface ImageData {
  FullyShot: string
  DefaultColor: string
  DefaultShot: string
  SaleColor: string
  SaleShot: string
  SubColor?: any
  SubShot?: any
  AltText?: any
  Videos: any[]
}

export interface SizeData {
  Full: string[]
  Sale: string[]
  Auto: any[]
}

export interface Full {
  white: string[]
  ivory: string[]
  multicolor: string[]
}

export interface Sale {
  multicolor: string[]
}

export interface ColorMap {
  Full: Full
  FullCount: number
  Sale: Sale
  SaleCount: number
}

export interface DisplayOn {
  Full: boolean
  Sale: boolean
  Grid: boolean
  Search: boolean
}

export interface Color {
  ColorName: string
  ColorNumber: string
  ParentColor: string[]
}

export interface Variant {
  VariantId: string
  Upc: string
  IsSale: boolean
  InStock: boolean
  IsFreshOutOfStock: boolean
  OutOfStockTimestamp: number
  SkuIntroductionTimestamp: number
  ParentSize?: any
  Size: string
  Color: Color
  WillReplenish: boolean
  IsAutoShip: boolean
  Inventory: number
  Price: number
  Zone1Price: number
  Zone2Price?: number
  SkuMarkdownPrice?: any
  Status: string
}

export default interface BaseJockeyProduct {
  _DbId?: any
  MetaDisplay?: any
  Meta: Meta
  Matrix: Matrix
  Breadcrumbs: Breadcrumb[]
  Id: string
  DisplayName: string
  UrlId: string
  StyleIntroDate?: any
  Price: number
  CostPrice?: any
  SortPrice: number
  SaleSortPrice: number
  StyleMarkdownPrice?: any
  SkuMarkdownPrice: number
  HasVariantOnSkuMarkdown: boolean
  ZonePrice: number
  ImageData: ImageData
  SizeData: SizeData
  ColorMap: ColorMap
  DisplayOn: DisplayOn
  IsDisplayableOnSale: boolean
  Rating: number
  SizeChartType: string
  Description: string
  FabricContent: string
  BulletString?: any
  Bullets: string[]
  ReasonToBe?: any
  MultiPricing?: any
  BreadCrumbTailValue?: any
  BreadCrumbTailType?: any
  Variants: Variant[]
  CompProducts: string[]
  Inventory: number
  IsNew: boolean
  Badge?: any
  Wordmark?: any
  SaleWordmark?: any
  Favorited: boolean
  IsPreview: boolean
  Status: string
  NeedsStatusChange: boolean
  Weight: number
}
