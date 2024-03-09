import BigNumber from 'bignumber.js';

export const validRequired = (value: string | number | undefined | null) => {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return true;
};

export const VEGA_ID_REGEX = /^[A-Fa-f0-9]{64}$/i;
export const validVegaPublicKey = (value: string) => {
  return VEGA_ID_REGEX.test(value);
};

export const URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})+)(:[0-9]{1,5})?(\/[^\s]*)?$/;
export const validUrl = (value: string) => {
  return URL_REGEX.test(value);
};

export const ETH_ADDRESS = /^0x[0-9a-fA-F]{40}$/i;
export const validEthAddress = (value: string) => {
  return ETH_ADDRESS.test(value);
};

export const validMinSafe = (
  value: string | number | BigNumber,
  min: string | number | BigNumber
) => {
  return new BigNumber(value).isLessThan(min);
};

export const validMaxSafe = (
  value: string | number | BigNumber,
  max: string | number | BigNumber
) => {
  return new BigNumber(value).isGreaterThan(max);
};

export const validJSON = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
};

export const validForSyntaxHighlighter = (str: string) => {
  try {
    const test = JSON.parse(str);
    return test && Object.keys(test).length > 0;
  } catch (e) {
    return false;
  }
};

export const validStep = (step: string | number, input?: string | number) => {
  const stepValue = new BigNumber(step);
  if (stepValue.isNaN()) {
    // unable to check if step is not a number
    return false;
  }
  if (stepValue.isZero()) {
    // every number is valid when step is zero
    return true;
  }

  const value = new BigNumber(input || '');
  return value.modulo(stepValue).isZero();
};
