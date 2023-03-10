import { encodeListAsset, encodeListAssetBridgeTx } from './list-asset';

describe('List Asset ABI encoder', () => {
  it('throws if asset erc20 address is invalid', () => {
    expect(() => {
      encodeListAsset({
        assetERC20: '123',
        assetId: '0x456',
        limit: '1',
        threshold: '1',
        nonce: '1',
      });
    }).toThrowError('Asset ERC20 and assetID must be hex values');
  });

  it('throws if assetId is not hex encoded', () => {
    expect(() => {
      encodeListAsset({
        assetERC20: '0x123',
        assetId: '456',
        limit: '1',
        threshold: '1',
        nonce: '1',
      });
    }).toThrowError('Asset ERC20 and assetID must be hex values');
  });

  it('throws if values to not match expected format', () => {
    expect(() => {
      encodeListAsset({
        assetERC20: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
        assetId: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
        limit: 'not a valid number',
        threshold: '1',
        nonce: '1',
      });
    }).toThrowError(/incorrect data length/);
  });

  it('returns an ABI encoded value if inputs are valid', () => {
    const EXPECTED_OUTPUT =
      '0x000000000000000000000000b063f5504610ba4b8db230d9f884bfadc1e31da00b87ac58d4af7fc11c8b417153fcb62631cfd9643835ef28db3f5a1caef0b37900000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000a6c6973745f617373657400000000000000000000000000000000000000000000';

    const res = encodeListAsset({
      assetERC20: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
      assetId:
        '0x0b87ac58d4af7fc11c8b417153fcb62631cfd9643835ef28db3f5a1caef0b379',
      limit: '1',
      threshold: '1',
      nonce: '1',
    });

    expect(res).toEqual(EXPECTED_OUTPUT);
  });

  it('encodeListAssetBridge returns a keccak256 hash of the bridge tx', () => {
    const EXPECTED_OUTPUT =
      '0xe0e62b27fe4490025d312bb2e37486f56935a3d9442dc34c2b918b2a28a386f2';

    const res = encodeListAssetBridgeTx(
      {
        assetERC20: '0xb063f5504610ba4b8db230d9f884bfadc1e31da0',
        assetId:
          '0x0b87ac58d4af7fc11c8b417153fcb62631cfd9643835ef28db3f5a1caef0b379',
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
