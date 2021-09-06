export function makeKeyValuePairFromArrays<T extends string>(
  keys: T[],
  values: any[],
): Record<T, any> {
  return values.reduce((acc: Record<T, any>, value: any, index: number) => {
    acc[keys[index]] = value
    return acc
  }, {})
}
