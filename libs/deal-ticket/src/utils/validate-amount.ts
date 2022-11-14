import { t } from '@vegaprotocol/react-helpers';

export const validateAmount = (step: number, field: string) => {
  const [, stepDecimals = ''] = String(step).split('.');

  return (value: string) => {
    const [, valueDecimals = ''] = value.split('.');
    if (stepDecimals.length < valueDecimals.length) {
      if (stepDecimals === '') {
        return t(`${field} must be in whole numbers for this market`);
      }
      return t(`${field} accepts up to ${stepDecimals.length} decimal places`);
    }
    return true;
  };
};
