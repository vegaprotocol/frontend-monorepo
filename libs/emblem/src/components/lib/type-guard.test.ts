import { isEmblemByAsset } from './type-guard';

describe('isEmblemByAsset', () => {
  it('should return true if args is of type EmblemByAssetProps', () => {
    const args = { asset: 'exampleAsset', vegaChainId: 'fairground-123' };
    const result = isEmblemByAsset(args);
    expect(result).toBe(true);
  });

  it('should return true if args is of type EmblemByAssetProps, even without a vegaChainId (defaults to mainnet)', () => {
    const args = { asset: 'exampleAsset' };
    const result = isEmblemByAsset(args);
    expect(result).toBe(true);
  });

  it('should return false if args is of type EmblemByContractProps', () => {
    const args = { contract: 'exampleContract', chainId: '1' };
    const result = isEmblemByAsset(args);
    expect(result).toBe(false);
  });

  it('should return false if args does not have the required property', () => {
    const args = { otherProp: 'exampleProp' };
    // @ts-expect-error intentionally bad type to test type guard
    const result = isEmblemByAsset(args);
    expect(result).toBe(false);
  });
});
