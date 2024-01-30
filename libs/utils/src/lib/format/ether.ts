// eslint-disable-next-line no-restricted-imports
import { formatNumber, toBigNum } from './number';
import type BigNumber from 'bignumber.js';

export enum EtherUnit {
  /** 1 wei = 10^-18 ETH */
  wei = '0',
  /** 1 kwei = 1000 wei */
  kwei = '3',
  /** 1 mwei = 1000 kwei */
  mwei = '6',
  /** 1 gwei = 1000 kwei */
  gwei = '9',

  // other denominations:
  // microether = '12', // aka szabo, µETH
  // milliether = '15', // aka finney, mETH

  /** 1 ETH = 1B gwei = 10^18 wei */
  ether = '18',
}

export const etherUnitMapping: Record<EtherUnit, string> = {
  [EtherUnit.wei]: 'wei',
  [EtherUnit.kwei]: 'kwei',
  [EtherUnit.mwei]: 'mwei',
  [EtherUnit.gwei]: 'gwei',
  // [EtherUnit.microether]: 'µETH', // szabo
  // [EtherUnit.milliether]: 'mETH', // finney
  [EtherUnit.ether]: 'ETH',
};

type InputValue = string | number | BigNumber;
type UnitisedTuple = [value: BigNumber, unit: EtherUnit];

/**
 * Converts given raw value to the unitised tuple of amount and unit
 */
export const unitiseEther = (
  input: InputValue,
  forceUnit?: EtherUnit
): UnitisedTuple => {
  const units = Object.values(EtherUnit).reverse();

  let value = toBigNum(input, Number(forceUnit || EtherUnit.ether));
  let unit = forceUnit || EtherUnit.ether;

  if (!forceUnit) {
    for (const u of units) {
      const v = toBigNum(input, Number(u));
      value = v;
      unit = u;
      if (v.isGreaterThanOrEqualTo(1)) break;
    }
  }

  return [value, unit];
};

/**
 * `formatNumber` wrapper for unitised ether values (attaches unit name)
 */
export const formatEther = (
  input: UnitisedTuple,
  decimals = 0,
  noUnit = false
) => {
  const [value, unit] = input;
  const num = formatNumber(value, decimals);
  const unitName = noUnit ? '' : etherUnitMapping[unit];

  return `${num} ${unitName}`.trim();
};

/**
 * Utility function that formats given raw amount as ETH.
 * Example:
 *   Given value of `1` this will return `0.000000000000000001 ETH`
 */
export const asETH = (input: InputValue, noUnit = false) =>
  formatEther(
    unitiseEther(input, EtherUnit.ether),
    Number(EtherUnit.ether),
    noUnit
  );
