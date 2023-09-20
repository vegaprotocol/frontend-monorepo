import { renderHook } from '@testing-library/react';
import { useMarketOracle } from './use-market-oracle';
import type { MarketFieldsFragment } from '../__generated__/markets';
import type { Provider } from '../oracle-schema';

const ORACLE_PROOFS_URL = 'ORACLE_PROOFS_URL';

const address = 'address';
const key = 'key';
const dataSourceSpecId = 'dataSourceSpecId';

const mockEnvironment = jest.fn(() => ({ ORACLE_PROOFS_URL }));
const mockMarket = jest.fn<{ data: MarketFieldsFragment | null }, unknown[]>(
  () => ({
    data: {
      tradableInstrument: {
        instrument: {
          product: {
            __typename: 'Future',
            dataSourceSpecForSettlementData: {
              id: dataSourceSpecId,
              data: {
                sourceType: {
                  __typename: 'DataSourceDefinitionExternal',
                  sourceType: {
                    signers: [
                      {
                        signer: {
                          __typename: 'ETHAddress',
                          address,
                        },
                      },
                      {
                        signer: {
                          __typename: 'PubKey',
                          key,
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    } as MarketFieldsFragment,
  })
);

const mockOracleProofs = jest.fn<{ data?: Provider[] }, unknown[]>(() => ({}));

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: jest.fn((args) => mockEnvironment()),
}));

jest.mock('../markets-provider', () => ({
  useMarket: jest.fn((args) => mockMarket()),
}));

jest.mock('./use-oracle-proofs', () => ({
  useOracleProofs: jest.fn((args) => mockOracleProofs()),
}));

const marketId = 'marketId';
describe('useMarketOracle', () => {
  it('returns undefined if no market info present', () => {
    mockMarket.mockReturnValueOnce({ data: null });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current?.data).toBeUndefined();
  });

  it('returns undefined if no oracle proofs present', () => {
    mockOracleProofs.mockReturnValueOnce({ data: undefined });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current?.data).toBeUndefined();
  });

  it('returns oracle matched by eth_address', () => {
    const data = [
      {
        proofs: [
          {
            eth_address: 'eth_address',
            type: 'eth_address',
          },
        ],
        oracle: { eth_address: 'eth_address' },
      } as Provider,
      {
        proofs: [
          {
            eth_address: address,
            type: 'eth_address',
          },
        ],
        oracle: { eth_address: address },
      } as Provider,
    ];
    mockOracleProofs.mockReturnValueOnce({
      data,
    });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current?.data?.dataSourceSpecId).toBe(dataSourceSpecId);
    expect(result.current?.data?.provider).toBe(data[1]);
  });

  it('returns oracle matching by public_key', () => {
    const data = [
      {
        proofs: [
          {
            public_key: 'public_key',
            type: 'public_key',
          },
        ],
        oracle: {
          public_key: 'public_key',
        },
      } as Provider,
      {
        proofs: [
          {
            public_key: key,
            type: 'public_key',
          },
        ],
        oracle: {
          public_key: key,
        },
      } as Provider,
    ];
    mockOracleProofs.mockReturnValueOnce({
      data,
    });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current?.data?.dataSourceSpecId).toBe(dataSourceSpecId);
    expect(result.current?.data?.provider).toBe(data[1]);
  });
});
