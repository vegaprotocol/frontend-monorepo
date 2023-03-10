import { encodeUpdateAsset, encodeUpdateAssetBridgeTx } from './update-asset';

describe('Update Asset ABI encoder', () => {
  it('throws if asset erc20 address is invalid', () => {
    expect(() => {
      encodeUpdateAsset({
        assetERC20: '123',
        limit: '1',
        threshold: '1',
        nonce: '1',
      });
    }).toThrowError('Asset ERC20 must be a valid address');
  });

  it('throws if an input is invalid', () => {
    expect(() => {
      encodeUpdateAsset({
        assetERC20: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
        limit: 'hello',
        threshold: '1',
        nonce: '1',
      });
    }).toThrowError(/invalid BigNumber/);
  });

  it('returns an ABI encoded value if inputs are valid', () => {
    const EXPECTED_OUTPUT =
      '0x000000000000000000000000b063f5504610ba4b8db230d9f884bfadc1e31da000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000107365745f61737365745f6c696d69747300000000000000000000000000000000';

    const res = encodeUpdateAsset({
      assetERC20: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
      limit: '1',
      threshold: '1',
      nonce: '1',
    });

    expect(res).toEqual(EXPECTED_OUTPUT);
  });

  it('encodeUpdateAssetBridge returns a keccak256 hash of the bridge tx', () => {
    const EXPECTED_OUTPUT =
      '0xeb240131c4558aebfab3da0ddbea1ac0447b9f5670899af2d78795867631d877';

    const res = encodeUpdateAssetBridgeTx(
      {
        assetERC20: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
        limit: '1',
        threshold: '1',
        nonce: '1',
      },
      '0xb063f5504610ba4b8db230d9f884bfadc1e31da0'
    );

    // Magic number: keccak256 hash length + '0x'
    expect(res.length).toEqual(66);
    expect(res).toEqual(EXPECTED_OUTPUT);
  });
});
