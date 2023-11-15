import { getQuantumValue } from './utils';

describe('getQuantumValue', () => {
  it('converts a value into its value in quantum AKA (qUSD)', () => {
    expect(getQuantumValue('1000000', '1000000').toString()).toEqual('1');
    expect(getQuantumValue('2000000', '1000000').toString()).toEqual('2');
    expect(getQuantumValue('2500000', '1000000').toString()).toEqual('2.5');
    expect(getQuantumValue('10000', '1000000').toString()).toEqual('0.01');
    expect(
      getQuantumValue('1000000000000000000', '1000000000000000000').toString()
    ).toEqual('1');
    expect(getQuantumValue('100000000', '100000000').toString()).toEqual('1');
    expect(getQuantumValue('150000000', '100000000').toString()).toEqual('1.5');
  });
});
