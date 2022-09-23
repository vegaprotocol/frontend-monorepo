export const positiveClassNames = 'text-vega-green-dark dark:text-vega-green';
export const negativeClassNames = 'text-vega-red-dark dark:text-vega-red';

const isPositive = ({ value }: { value: string | bigint | number }) =>
  !!value &&
  ((typeof value === 'string' && !value.startsWith('-')) || value > 0);

const isNegative = ({ value }: { value: string | bigint | number }) =>
  !!value &&
  ((typeof value === 'string' && value.startsWith('-')) || value < 0);

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
