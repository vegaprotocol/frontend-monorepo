import { formatWithAsset } from './liquidity-utils';

describe('formatWithAsset', () => {
  it('should return formatted string', () => {
    const result = formatWithAsset('103926176181', {
      decimals: 5,
      symbol: 'tEURO',
    });

    expect(result).toEqual('1,039,261.76181 tEURO');
  });
});
