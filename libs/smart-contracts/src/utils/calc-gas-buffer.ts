import type { BigNumber as EthersBigNumber } from 'ethers';

export function calcGasBuffer(value: EthersBigNumber): EthersBigNumber {
  return value.mul(120).div(100);
}
