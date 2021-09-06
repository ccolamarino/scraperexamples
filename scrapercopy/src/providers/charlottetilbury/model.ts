export interface PurchasePrice {
  value: number
  currencyCode: string
  percentage?: any
}

export interface ListingPrice {
  value: number
  currencyCode: string
  percentage?: any
}

export interface FromPrice {
  value?: any
  currencyCode?: any
  percentage?: any
}

export interface Price {
  purchasePrice: PurchasePrice
  listingPrice: ListingPrice
  fromPrice: FromPrice
}

export interface Image {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface SwatchImage {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface SwatchImage2 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Appearance {
  name: string
  swatchImage: SwatchImage2
  holitionProductId: string
  merchandiseAs: string
}

export interface Product {
  id: string
  title: string
  previouslyKnownAs?: any
  configurableVersion?: any
  subtitle: string
  sku: string
  badge?: any
  price: Price
  availability: string
  availableStock: number
  images: Image[]
  shortVideo?: any
  sellBlockAccordion?: any
  description: string
  descriptionHeadline: string
  longDescription: string
  additionalDescription: string
  cardDescription?: any
  ingredients: string
  applicationTips: string
  category: string
  href: string
  bundleItems: any[]
  type: string
  swatchVariant: string
  swatchPosition: number
  swatchImage: SwatchImage
  fill?: any
  fillObj?: any
  pricePerQuantity?: any
  shade?: any
  tryOnId: string
  fullSizeSku?: any
  appearances: Appearance[]
  applicablePromotions: any[]
  virtualServiceDetails?: any
  routineSubheading?: any
  repeatedShadesAllowed?: any
  productParent?: any
  customisations: any[]
}

export interface EU {
  slug: string
}

export interface DE {
  slug: string
}

export interface HK {
  slug: string
}

export interface AU {
  slug: string
}

export interface UK {
  slug: string
}

export interface IT {
  slug: string
}

export interface IE {
  slug: string
}

export interface FR {
  slug: string
}

export interface US {
  slug: string
}

export interface CA {
  slug: string
}

export interface ES {
  slug: string
}

export interface NL {
  slug: string
}

export interface HrefLangs {
  EU: EU
  DE: DE
  HK: HK
  AU: AU
  UK: UK
  IT: IT
  IE: IE
  FR: FR
  US: US
  CA: CA
  ES: ES
  NL: NL
}

export interface PageSettings {
  canonicalLink: string
  title: string
  metaDescription: string
  metaKeyword: string
  robotMetaTags: any[]
  errorPageSlug: string
  hrefLangs: HrefLangs
  loyaltyPage: boolean
}

export interface Breadcrumb {
  label: string
  href: string
}

export interface PurchasePrice2 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface ListingPrice2 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface FromPrice2 {
  value?: any
  currencyCode?: any
  percentage?: any
}

export interface Price2 {
  purchasePrice: PurchasePrice2
  listingPrice: ListingPrice2
  fromPrice: FromPrice2
}

export interface BundleListPriceDiscountAmount {
  value: number
  currencyCode: string
  percentage?: any
}

export interface BundleSellPriceDiscountAmount {
  value: number
  currencyCode: string
  percentage?: any
}

export interface Image2 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Poster {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface ShortVideo {
  videoSrc: string
  description: string
  title: string
  poster: Poster
}

export interface SwatchImage3 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Image3 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Image4 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface PurchasePrice3 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface ListingPrice3 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface FromPrice3 {
  value?: any
  currencyCode?: any
  percentage?: any
}

export interface Price3 {
  purchasePrice: PurchasePrice3
  listingPrice: ListingPrice3
  fromPrice: FromPrice3
}

export interface SwatchImage4 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Appearance2 {
  name: string
  swatchImage: SwatchImage4
  holitionProductId: string
  merchandiseAs: string
}

export interface Sibling {
  lineItemId: string
  title: string
  subtitle: string
  previouslyKnownAs?: any
  id: string
  preSelected: boolean
  sku: string
  href: string
  description: string
  category: string
  swatchImage: SwatchImage3
  image: Image3
  images: Image4[]
  availability: string
  availableStock: number
  type: string
  swatchPosition: number
  fill?: any
  fillObj?: any
  pricePerQuantity?: any
  shade?: any
  tryOnId?: any
  shadeVariant: string
  price: Price3
  appearances: Appearance2[]
  bundleItems?: any
  priceAdjustment?: any
}

export interface BundleItem {
  title: string
  siblings: Sibling[]
}

export interface SwatchImage5 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface FillObj {
  amount: number
  unit: string
}

export interface Quantity {
  amount: number
  unit: string
}

export interface Price4 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface PricePerQuantity {
  quantity: Quantity
  price: Price4
}

export interface SwatchImage6 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Appearance3 {
  name: string
  swatchImage: SwatchImage6
  holitionProductId: string
  merchandiseAs: string
}

export interface Product2 {
  id: string
  title: string
  previouslyKnownAs: string
  configurableVersion?: any
  subtitle: string
  sku: string
  badge: string
  price: Price2
  bundleListPriceDiscountAmount: BundleListPriceDiscountAmount
  bundleSellPriceDiscountAmount: BundleSellPriceDiscountAmount
  bundleListPriceDiscountPercent: number
  bundleSellPriceDiscountPercent: number
  availability: string
  availableStock: number
  images: Image2[]
  shortVideo: ShortVideo
  sellBlockAccordion?: any
  description: string
  descriptionHeadline: string
  longDescription: string
  additionalDescription: string
  cardDescription: string
  ingredients: string
  applicationTips: string
  category: string
  href: string
  bundleItems: BundleItem[]
  type: string
  swatchVariant: string
  swatchPosition: number
  swatchImage: SwatchImage5
  fill: string
  fillObj: FillObj
  pricePerQuantity: PricePerQuantity
  shade: string
  tryOnId: string
  fullSizeSku?: any
  appearances: Appearance3[]
  applicablePromotions: any[]
  virtualServiceDetails?: any
  routineSubheading?: any
  repeatedShadesAllowed?: any
  productParent?: any
  customisations?: any
}

export interface PurchasePrice4 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface ListingPrice4 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface FromPrice4 {
  value?: any
  currencyCode?: any
  percentage?: any
}

export interface Price5 {
  purchasePrice: PurchasePrice4
  listingPrice: ListingPrice4
  fromPrice: FromPrice4
}

export interface Image5 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Poster2 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface ShortVideo2 {
  videoSrc: string
  description: string
  title: string
  poster: Poster2
}

export interface SwatchImage7 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface FillObj2 {
  amount: number
  unit: string
}

export interface Quantity2 {
  amount: number
  unit: string
}

export interface Price6 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface PricePerQuantity2 {
  quantity: Quantity2
  price: Price6
}

export interface SwatchImage8 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Appearance4 {
  name: string
  swatchImage: SwatchImage8
  holitionProductId: string
  merchandiseAs: string
}

export interface Replacement {
  id: string
  title: string
  previouslyKnownAs?: any
  configurableVersion?: any
  subtitle: string
  sku: string
  badge: string
  price: Price5
  availability: string
  availableStock: number
  images: Image5[]
  shortVideo: ShortVideo2
  sellBlockAccordion?: any
  description: string
  descriptionHeadline: string
  longDescription: string
  additionalDescription: string
  cardDescription: string
  ingredients: string
  applicationTips: string
  category: string
  href: string
  bundleItems: any[]
  type: string
  swatchVariant: string
  swatchPosition: number
  swatchImage: SwatchImage7
  fill: string
  fillObj: FillObj2
  pricePerQuantity: PricePerQuantity2
  shade?: any
  tryOnId: string
  fullSizeSku?: any
  appearances: Appearance4[]
  applicablePromotions: any[]
  virtualServiceDetails?: any
  routineSubheading?: any
  repeatedShadesAllowed?: any
  productParent?: any
  customisations?: any
}

export interface Image6 {
  imageSrc: string
  alt?: any
  title: string
  width: number
  height: number
}

export interface Image7 {
  imageSrc: string
  alt?: any
  title: string
  width: number
  height: number
}

export interface SkinTone {
  title: string
  shade: number
  image: Image7
  type: string
}

export interface Widget {
  type: string
  title: string
  description?: any
  products: Product2[]
  replacements: Replacement[]
  images: Image6[]
  skinTones: SkinTone[]
  videoUrl: string
  theme?: any
  aspectRatio: string
  posterImage?: any
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

export interface SwatchImage9 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Image8 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Image9 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface FillObj3 {
  amount: number
  unit: string
}

export interface Quantity3 {
  amount: number
  unit: string
}

export interface Price7 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface PricePerQuantity3 {
  quantity: Quantity3
  price: Price7
}

export interface PurchasePrice5 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface ListingPrice5 {
  value: number
  currencyCode: string
  percentage?: any
}

export interface FromPrice5 {
  value?: any
  currencyCode?: any
  percentage?: any
}

export interface Price8 {
  purchasePrice: PurchasePrice5
  listingPrice: ListingPrice5
  fromPrice: FromPrice5
}

export interface SwatchImage10 {
  imageSrc: string
  alt: string
  title: string
  width: number
  height: number
}

export interface Appearance5 {
  name: string
  swatchImage: SwatchImage10
  holitionProductId: string
  merchandiseAs: string
}

export interface Sibling2 {
  lineItemId?: any
  title: string
  subtitle: string
  previouslyKnownAs: string
  id: string
  preSelected: boolean
  sku: string
  href: string
  description: string
  category: string
  swatchImage: SwatchImage9
  image: Image8
  images: Image9[]
  availability: string
  availableStock: number
  type: string
  swatchPosition: number
  fill: string
  fillObj: FillObj3
  pricePerQuantity: PricePerQuantity3
  shade?: any
  tryOnId: string
  shadeVariant?: any
  price: Price8
  appearances: Appearance5[]
  bundleItems?: any
  priceAdjustment?: any
}

export default interface CharlotteModel {
  product: Product
  pageSettings: PageSettings
  breadcrumbs: Breadcrumb[]
  widgets: Widget[]
  featureBlock: any[]
  siblings: Sibling2[]
}
