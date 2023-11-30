import { useCallback } from 'react';
import { useT } from '../use-t';

export const useValidateAmount = () => {
  const t = useT();
  return useCallback(
    (step: number | string, field: string) => {
      const [, stepDecimals = ''] = String(step).split('.');

      return (value?: string) => {
        if (Number(step) > 1) {
          if (Number(value) % Number(step) > 0) {
            return t(
              '{{field}} must be a multiple of {{step}} for this market',
              {
                field,
                step,
              }
            );
          }
          return true;
        }
        const [, valueDecimals = ''] = (value || '').split('.');
        if (stepDecimals.length < valueDecimals.length) {
          if (stepDecimals === '') {
            return t('{{field}} must be whole numbers for this market', {
              field,
            });
          }
          return t('{{field}} accepts up to {{decimals}} decimal places', {
            field,
            decimals: stepDecimals.length,
          });
        }
        return true;
      };
    },
    [t]
  );
};
