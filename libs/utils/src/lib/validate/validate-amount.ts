import { useCallback } from 'react';
import { useT } from '../use-t';
import BigNumber from 'bignumber.js';

export const useValidateAmount = () => {
  const t = useT();
  return useCallback(
    (step: number | string, field: string) => {
      return (value?: string) => {
        const isValid = validateAgainstStep(step, value);
        if (!isValid) {
          if (new BigNumber(step).isEqualTo(1)) {
            return t('{{field}} must be whole numbers for this market', {
              field,
              step,
            });
          }

          return t('{{field}} must be a multiple of {{step}} for this market', {
            field,
            step,
          });
        }
        return true;
      };
    },
    [t]
  );
};

const isMultipleOf = (value: BigNumber, multipleOf: BigNumber) =>
  value.modulo(multipleOf).isZero();

export const validateAgainstStep = (
  step: string | number,
  input?: string | number
) => {
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
  return isMultipleOf(value, stepValue);
};
