export const getValidItem = <T>(
  value: T | null | undefined,
  set: T[],
  defaultValue: T
) =>
  value !== null && value !== undefined && set.includes(value)
    ? value
    : defaultValue;
