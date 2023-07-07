export const positiveClassNames =
  'text-market-green-600 dark:text-market-green';
export const negativeClassNames = 'text-market-red dark:text-market-red';

const isPositive = ({ value }: { value: string | bigint | number }) =>
  !!value &&
  ((typeof value === 'string' && !value.startsWith('-')) ||
    ((typeof value === 'number' || typeof value === 'bigint') && value > 0));

const isNegative = ({ value }: { value: string | bigint | number }) =>
  !!value &&
  ((typeof value === 'string' && value.startsWith('-')) ||
    ((typeof value === 'number' || typeof value === 'bigint') && value < 0));

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
