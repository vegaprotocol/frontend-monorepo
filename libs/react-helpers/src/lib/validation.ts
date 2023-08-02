export const getValidItem = <T>(
  value: T | null | undefined,
  set: T[],
  defaultValue: T
) =>
  value !== null && value !== undefined && set.includes(value)
    ? value
    : defaultValue;

export const getValidSubset = <T>(
  value: T[] | null | undefined,
  set: T[],
  defaultValue: T[]
) =>
  value !== null && value !== undefined
    ? value.filter((item) => set.includes(item))
    : defaultValue;
