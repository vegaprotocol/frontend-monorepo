import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import * as utils from '@vegaprotocol/utils';
import { useT } from './use-t';

export const useRequired = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (!utils.validRequired(value)) {
        return t('Required');
      }
      return true;
    },
    [t]
  );
};

export const useEthereumAddress = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (!utils.validEthAddress(value)) {
        return t('Invalid Ethereum address');
      }
      return true;
    },
    [t]
  );
};

export const useVegaPublicKey = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (!utils.validVegaPublicKey(value)) {
        return t('Invalid Vega key');
      }
      return true;
    },
    [t]
  );
};

export const useMinSafe = () => {
  const t = useT();
  return useCallback(
    (min: BigNumber) => (value: string) => {
      if (utils.validMinSafe(value, min)) {
        return t('Value is below minimum');
      }
      return true;
    },
    [t]
  );
};

export const useMaxSafe = () => {
  const t = useT();
  return useCallback(
    (max: BigNumber) => (value: string) => {
      if (utils.validMaxSafe(value, max)) {
        return t('Value is above maximum');
      }
      return true;
    },
    [t]
  );
};

export const useValidateJson = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (!utils.validJSON(value)) {
        return t('Must be valid JSON');
      }
      return true;
    },
    [t]
  );
};

export const useValidateUrl = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (!utils.validUrl(value)) {
        return t('Invalid URL');
      }
      return true;
    },
    [t]
  );
};

/** Used in deal ticket price/size amounts */
export const useValidateAmount = () => {
  const t = useT();
  return useCallback(
    (step: number | string, field: string) => {
      return (value?: string) => {
        if (!utils.validStep(step, value)) {
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
