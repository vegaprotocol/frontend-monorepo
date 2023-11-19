import BigNumber from 'bignumber.js';
import { useT } from '../use-t';
import { useCallback } from 'react';

export const useRequired = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (value === null || value === undefined || value === '') {
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
      if (!/^0x[0-9a-fA-F]{40}$/i.test(value)) {
        return t('Invalid Ethereum address');
      }
      return true;
    },
    [t]
  );
};

export const VEGA_ID_REGEX = /^[A-Fa-f0-9]{64}$/i;
export const useVegaPublicKey = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      if (!VEGA_ID_REGEX.test(value)) {
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
      if (new BigNumber(value).isLessThan(min)) {
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
      if (new BigNumber(value).isGreaterThan(max)) {
        return t('Value is above maximum');
      }
      return true;
    },
    [t]
  );
};

export const suitableForSyntaxHighlighter = (str: string) => {
  try {
    const test = JSON.parse(str);
    return test && Object.keys(test).length > 0;
  } catch (e) {
    return false;
  }
};

export const useValidateJson = () => {
  const t = useT();
  return useCallback(
    (value: string) => {
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return t('Must be valid JSON');
      }
    },
    [t]
  );
};
