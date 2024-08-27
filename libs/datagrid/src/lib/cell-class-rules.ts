import BigNumber from 'bignumber.js';

export const positiveClassNames = 'text-dir-up-fg';
export const negativeClassNames = 'text-dir-down-fg';
export const zeroClassNames = 'text-orange';

const isPositive = ({ value }: { value: string | bigint | number }) =>
  !!value &&
  ((typeof value === 'string' && !value.startsWith('-') && value !== '0') ||
    ((typeof value === 'number' || typeof value === 'bigint') && value > 0));

const isNegative = ({ value }: { value: string | bigint | number }) =>
  !!value &&
  ((typeof value === 'string' && value.startsWith('-')) ||
    ((typeof value === 'number' || typeof value === 'bigint') && value < 0));

export const isZero = ({ value }: { value: string | bigint | number }) =>
  BigNumber(value.toString()).isZero();

export const signedNumberCssClass = (value: string | bigint | number) => {
  if (isPositive({ value })) {
    return positiveClassNames;
  }
  if (isNegative({ value })) {
    return negativeClassNames;
  }
  return '';
};

export const signedNumberCssClassRules = {
  [positiveClassNames]: isPositive,
  [negativeClassNames]: isNegative,
};
