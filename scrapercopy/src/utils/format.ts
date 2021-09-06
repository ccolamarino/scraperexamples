export const gap = (spaces: number, value: string | number) =>
  ('0'.repeat(spaces) + value.toString()).substr(-1 * spaces)
