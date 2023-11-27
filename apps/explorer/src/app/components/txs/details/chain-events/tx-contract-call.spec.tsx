import { decodeEthCallResult } from './tx-contract-call';
import { base64 } from 'ethers/lib/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';

describe('decodeEthCallResult', () => {
  it('should decode contractData correctly (mocked)', () => {
    const mockContractData = base64.encode(
      defaultAbiCoder.encode(['int256'], [BigNumber.from(123)])
    );
    const result = decodeEthCallResult(mockContractData);
    expect(result).toBe('123');
  });

  it('should decode contractData correctly (known data)', () => {
    const mockContractData = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADH8cueyY=';
    const result = decodeEthCallResult(mockContractData);
    expect(result).toBe('3435020581670');
  });

  it('should return "-" when an error occurs', () => {
    const mockContractData = 'invalid_data';
    const result = decodeEthCallResult(mockContractData);
    expect(result).toBe('-');
  });
});
