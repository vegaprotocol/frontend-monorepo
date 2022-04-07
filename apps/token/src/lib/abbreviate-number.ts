import { BigNumber } from "./bignumber";

export const getAbbreviatedNumber = (num: BigNumber) => {
  const number = num.toNumber();
  if (number < 1000) {
    return Number(num.toFixed()).toLocaleString();
  } else if (number < 1000000) {
    return Number((number / 1000).toFixed()).toLocaleString() + "K";
  }
  return Number((number / 1000000).toFixed()).toLocaleString() + "M";
};
