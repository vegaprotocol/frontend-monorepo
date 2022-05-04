import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { t } from '../i18n';

export const required = (value: string) => {
  if (value === null || value === undefined || value === '') {
    return t('Required');
  }
  return true;
};

export const ethereumAddress = (value: string) => {
  if (!ethers.utils.isAddress(value)) {
    return t('Invalid Ethereum address');
  }
  return true;
};

export const vegaPublicKey = (value: string) => {
  if (value.length !== 64 || !/^[A-Fa-f0-9]*$/i.test(value)) {
    return t('Invalid Vega key');
  }
  return true;
};

export const minSafe = (min: BigNumber) => (value: string) => {
  if (new BigNumber(value).isLessThan(min)) {
    return t('Value is below minimum');
  }
  return true;
};

export const maxSafe = (max: BigNumber) => (value: string) => {
  if (new BigNumber(value).isGreaterThan(max)) {
    return t('Value is above maximum');
  }
  return true;
};
