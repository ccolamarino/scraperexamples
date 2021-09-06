export interface JaneOptionValue {
  id: number
  valueText: string
  additionalPrice?: number
  imageUrl?: string
}

export interface JaneOption {
  id: number
  name: string
  values: JaneOptionValue[]
}

export interface JaneVariantOption {
  productOptionId: number
  productOptionValueId: number
}

export interface JaneVariant {
  productVariantId: number
  quantity: number
  soldQuantity?: number
  optionValues: JaneVariantOption[]
}

export interface JaneImage {
  url: string
}

export default interface JaneResponse {
  title: string
  url: string
  description: string
  price: number
  retail: number
  options: JaneOption[]
  variants: JaneVariant[]
  mainImageUrl?: string
  images?: JaneImage[]
  featureList?: []
  sellerName: string
}

export const getProductOption = (response: JaneResponse, id: number) =>
  response.options.find(option => option.id === id)

export type JaneProductOptionValue = JaneOption & JaneOptionValue
export const getProductOptionValue = (respone: JaneResponse, option: JaneVariantOption) => {
  const family = getProductOption(respone, option.productOptionId)
  const value = family?.values.find(element => element.id === option.productOptionValueId)
  return { ...family, ...value } as JaneProductOptionValue
}
