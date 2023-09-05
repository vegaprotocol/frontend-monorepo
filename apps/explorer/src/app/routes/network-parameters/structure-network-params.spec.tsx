import type { GroupedParams } from './structure-network-params';
import {
  structureParams,
  sortGroupedParams,
  structureNetworkParams,
} from './structure-network-params';

describe('structureParams', () => {
  it('should correctly structure params', () => {
    const input = [
      { key: 'spam.protection.delegation.min.tokens', value: '10' },
      { key: 'spam.protection.voting.min.tokens', value: '5' },
    ];
    const output: GroupedParams = {
      spam: {
        protection: {
          delegation: {
            min: {
              tokens: '10',
            },
          },
          voting: {
            min: {
              tokens: '5',
            },
          },
        },
      },
    };
    expect(structureParams(input)).toEqual(output);
  });

  it('should handle top-level keys correctly', () => {
    const input = [{ key: 'levelOne', value: '10' }];
    const output = {
      levelOne: '10',
    };
    expect(structureParams(input)).toEqual(output);
  });
});

describe('sortGroupedParams', () => {
  it('should correctly sort grouped params', () => {
    const input: GroupedParams = {
      spam: {
        protection: {
          delegation: {
            min: {
              tokens: '10',
            },
          },
        },
      },
      reward: '50',
    };
    const output: GroupedParams = {
      reward: '50',
      spam: {
        protection: {
          delegation: {
            min: {
              tokens: '10',
            },
          },
        },
      },
    };
    expect(sortGroupedParams(input)).toEqual(output);
  });

  it('should handle already sorted keys', () => {
    const input = {
      a: '10',
      b: {
        c: '5',
        d: '6',
      },
    };
    expect(sortGroupedParams(input)).toEqual(input);
  });
});

describe('structureNetworkParams', () => {
  it('should structure and sort network params correctly', () => {
    const input = [
      { key: 'spam.protection.delegation.min.tokens', value: '10' },
      { key: 'reward.asset', value: '50' },
    ];
    const output: GroupedParams = {
      reward: {
        asset: '50',
      },
      spam: {
        protection: {
          delegation: {
            min: {
              tokens: '10',
            },
          },
        },
      },
    };
    expect(structureNetworkParams(input)).toEqual(output);
  });

  it('should return an empty object if no params are provided', () => {
    expect(structureNetworkParams([])).toEqual({});
  });
});
