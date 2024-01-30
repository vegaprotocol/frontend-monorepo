import BigNumber from 'bignumber.js';
import { EtherUnit, formatEther, unitiseEther } from './ether';

describe('unitiseEther', () => {
  it.each([
    [1, '1', EtherUnit.wei],
    [999, '999', EtherUnit.wei],
    [1000, '1', EtherUnit.kwei],
    [9999, '9.999', EtherUnit.kwei],
    [10000, '10', EtherUnit.kwei],
    [999999, '999.999', EtherUnit.kwei],
    [1000000, '1', EtherUnit.mwei],
    [999999999, '999.999999', EtherUnit.mwei],
    [1000000000, '1', EtherUnit.gwei],
    ['999999999999999999', '999999999.999999999', EtherUnit.gwei], // max gwei
    [1e18, '1', EtherUnit.ether], // 1 ETH
    [1234e18, '1234', EtherUnit.ether], // 1234 ETH
  ])('unitises %s to [%s, %s]', (value, expectedOutput, expectedUnit) => {
    const [output, unit] = unitiseEther(value);
    expect(output.toFixed()).toEqual(expectedOutput);
    expect(unit).toEqual(expectedUnit);
  });

  it('unitises to requested unit', () => {
    const [output, unit] = unitiseEther(1, EtherUnit.kwei);
    expect(output).toEqual(BigNumber(0.001));
    expect(unit).toEqual(EtherUnit.kwei);
  });
});

describe('formatEther', () => {
  it.each([
    [1, EtherUnit.wei, '1 wei'],
    [12, EtherUnit.kwei, '12 kwei'],
    [123, EtherUnit.gwei, '123 gwei'],
    [3, EtherUnit.ether, '3 ETH'],
    [234.67776331, EtherUnit.gwei, '235 gwei'],
    [12.12, EtherUnit.gwei, '12 gwei'],
  ])('formats [%s, %s] to "%s"', (value, unit, expectedOutput) => {
    expect(formatEther([BigNumber(value), unit])).toEqual(expectedOutput);
  });
});
