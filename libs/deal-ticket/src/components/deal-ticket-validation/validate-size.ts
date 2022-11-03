import { ERROR_SIZE_DECIMAL } from '../constants';

export const validateSize = (step: number) => {
  const [, stepDecimals = ''] = String(step).split('.');
  return (value: string) => {
    const [, valueDecimals = ''] = value.split('.');
    if (stepDecimals.length < valueDecimals.length) {
      return ERROR_SIZE_DECIMAL;
    }
    return true;
  };
};
