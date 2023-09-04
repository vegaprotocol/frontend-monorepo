import { t } from '@vegaprotocol/i18n';

export const validateAmount = (step: number | string, field: string) => {
  const [, stepDecimals = ''] = String(step).split('.');

  return (value?: string) => {
    if (Number(step) > 1) {
      if (Number(value) % Number(step) > 0) {
        return t(`${field} must be a multiple of ${step} for this market`);
      }
      return true;
    }
    const [, valueDecimals = ''] = (value || '').split('.');
    if (stepDecimals.length < valueDecimals.length) {
      if (stepDecimals === '') {
        return t(`${field} must be whole numbers for this market`);
      }
      return t(`${field} accepts up to ${stepDecimals.length} decimal places`);
    }
    return true;
  };
};
