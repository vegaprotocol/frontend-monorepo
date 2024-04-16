import { getVegaChain } from './get-chain';
import { ENV } from '@vegaprotocol/environment';

describe('getChain', () => {
  it('should return the default vega chain if no vegaChainId is provided', () => {
    const result = getVegaChain();
    expect(result).toEqual(DEFAULT_VEGA_CHAIN);
  });

  it('should return the vegaChainId from ENV if it is a string', () => {
    const mockVegaChainId = 'mock-chain-id';
    jest.spyOn(ENV, 'vegaChainId', 'get').mockReturnValue(mockVegaChainId);

    const result = getVegaChain();
    expect(result).toEqual(mockVegaChainId);
  });

  it('should return the provided vegaChainId if it is a string', () => {
    const mockVegaChainId = 'mock-chain-id';
    const result = getVegaChain(mockVegaChainId);
    expect(result).toEqual(mockVegaChainId);
  });
});
