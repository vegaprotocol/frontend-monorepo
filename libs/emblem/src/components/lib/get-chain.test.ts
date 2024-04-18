import { DEFAULT_VEGA_CHAIN } from '../../config';
import { getVegaChain } from './get-chain';

describe('getChain', () => {
  it('should return the default vega chain if no vegaChainId is provided', () => {
    const result = getVegaChain();
    expect(result).toEqual(DEFAULT_VEGA_CHAIN);
  });

  it('should return the provided vegaChainId if it is a string', () => {
    const mockVegaChainId = 'mock-chain-id';
    const result = getVegaChain(mockVegaChainId);
    expect(result).toEqual(mockVegaChainId);
  });
});
