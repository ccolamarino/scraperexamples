export interface WDDataSet extends DOMStringMap {
  longSku: string
  seq: string
  inventory: string
  inventoryStatus: string
  imageId: string
  kic: string
  kic_qv: string
  kic_tray: string
  swatchColorFamily: string
  swatch: string
  swatch_qv: string
  swatch_tray: string
  sizePrimary: string
  sizePrimary_qv: string
  sizePrimary_tray: string
  sizeSecondary: string
  sizeSecondary_qv: string
  sizeSecondary_tray: string
}

export interface ProductAttrs {
  BaseMeasurementSize: string
  gender: string
  TestHoverImage: string
  OFPModelHeight: string
  BaseInseamRegularMeasurement: number
  BaseInseamLongMeasurement: number
  BaseInseamShortMeasurement: number
  TestFaceOutImage: string
  OFPModelSize: string
  BaseFrontRiseMeasurement: number
  brand: string
  OFPModelName: string
  BaseLegOpeningCircumferenceMeasurement: number
}

export interface Prod {
  id: string
  isUGC?: boolean
  imageId: string
  index?: number
  type: string
  src: string
}

export interface Model {
  id: string
  isUGC?: boolean
  imageId: string
  index?: number
  type: string
  src: string
}

export interface Life {
  id: string
  isUGC?: boolean
  imageId: string
  index?: number
  type: string
  src: string
}

export interface ImageSets {
  prod: Prod[]
  model: Model[]
  life: Life[]
  ugc: any[]
  shopLook: string[]
  imageSetCallMade?: boolean
}

export interface Value {
  value: string
}

export interface CareInstructions {
  values: Value[]
  name: string
}

export interface Value2 {
  identifier: string
  value: string
}

export interface Inseam {
  values: Value2[]
}

export interface FisEligibility {
  name: string
  value: string
}

export interface RisEligibility {
  name: string
  value: string
}

export interface PopinsEligibility {
  name: string
  value: string
}

export interface Value3 {
  value: string
}

export interface FiberContent {
  name: string
  value: string
  values: Value3[]
}

export interface ProductAttrsComplex {
  CareInstructions: CareInstructions
  Inseam: Inseam
  fisEligibility: FisEligibility
  risEligibility: RisEligibility
  popinsEligibility: PopinsEligibility
  FiberContent: FiberContent
}

export interface Item {
  itemId: string
}

export interface Items {
  [id: number]: Item
}

export interface CatalogProduct {
  productAttrs: ProductAttrs
  imageId: string
  productId: string
  swatchSequence: string
  productPartNum: string
  lowestInventoryCount: number
  collection: string
  imageSets: ImageSets
  productAttrsComplex: ProductAttrsComplex
  priceFlag: string
  swatchId: string
  kicId: string
  sizeChartName: string
  shortDesc1: string
  name: string
  shortDesc: string
  items: Items
  longDesc: string
  shortDesc2: string
  imageDataModelPrepared?: boolean
  crosssellProductIds: string[]
}

export interface ProductCatalog {
  [id: number]: CatalogProduct
  [id: string]: CatalogProduct
}

export interface Item {
  listPriceFmt: string
  priceFlag: string
  itemId: string
  offerPrice: number
  offerPriceFmt: string
  listPrice: number
}

export interface ItemEntries {
  [id: number]: Item
  [id: string]: Item
}

export interface ProductPrices {
  productId: string
  items: ItemEntries
}
