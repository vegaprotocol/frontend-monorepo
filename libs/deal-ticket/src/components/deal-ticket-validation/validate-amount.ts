import { t } from '@vegaprotocol/react-helpers';

export const validateAmount = (
  step: number
): ((val: string) => string | boolean) => {
  const [, stepDecimals = ''] = String(step).split('.');
  return (value: string) => {
    const [, valueDecimals = ''] = value.split('.');
    console.log(stepDecimals, valueDecimals);
    if (stepDecimals.length < valueDecimals.length) {
      if (stepDecimals === '0') {
        return t('Order sizes must be in whole numbers for this market');
      }
      return t(
        `This field accepts up to ${stepDecimals.length} decimal places`
      );
    }
    return true;
  };
};
