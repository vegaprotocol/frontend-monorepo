import { BigNumber } from "./bignumber";

export const formatNumber = (value: BigNumber, decimals?: number) => {
  const decimalPlaces =
    typeof decimals === "undefined" ? Math.max(value.dp(), 2) : decimals;
  return value.dp(decimalPlaces).toFormat(decimalPlaces);
};
