import { renderHook } from '@testing-library/react';
import { useMarketOracle } from './use-market-oracle';
import type { MarketInfoQuery } from '../components/market-info/__generated__/MarketInfo';
import type { Provider } from '@vegaprotocol/oracles';

const ORACLE_PROOFS_URL = 'ORACLE_PROOFS_URL';

const address = 'address';
const key = 'key';

const mockEnvironment = jest.fn(() => ({ ORACLE_PROOFS_URL }));
const mockDataProvider = jest.fn<
  { data: MarketInfoQuery['market'] },
  unknown[]
>(() => ({
  data: {
    tradableInstrument: {
      instrument: {
        product: {
          dataSourceSpecForSettlementData: {
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
  } as MarketInfoQuery['market'],
}));

const mockOracleProofs = jest.fn<{ data?: Provider[] }, unknown[]>(() => ({}));

jest.mock('@vegaprotocol/environment', () => ({
  useEnvironment: jest.fn((args) => mockEnvironment()),
}));

jest.mock('@vegaprotocol/data-provider', () => ({
  ...jest.requireActual('@vegaprotocol/data-provider'),
  useDataProvider: jest.fn((args) => mockDataProvider()),
}));

jest.mock('@vegaprotocol/oracles', () => ({
  useOracleProofs: jest.fn((args) => mockOracleProofs()),
}));

const marketId = 'marketId';
describe('useMarketOracle', () => {
  it('returns undefined if no market info present', () => {
    mockDataProvider.mockReturnValueOnce({ data: null });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current).toBeUndefined();
  });

  it('returns undefined if no oracle proofs present', () => {
    mockOracleProofs.mockReturnValueOnce({ data: undefined });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current).toBeUndefined();
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
        oracle: {},
      } as Provider,
      {
        proofs: [
          {
            eth_address: address,
            type: 'eth_address',
          },
        ],
        oracle: {},
      } as Provider,
    ];
    mockOracleProofs.mockReturnValueOnce({
      data,
    });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current).toBe(data[1].oracle);
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
        oracle: {},
      } as Provider,
      {
        proofs: [
          {
            public_key: key,
            type: 'public_key',
          },
        ],
        oracle: {},
      } as Provider,
    ];
    mockOracleProofs.mockReturnValueOnce({
      data,
    });
    const { result } = renderHook(() => useMarketOracle(marketId));
    expect(result.current).toBe(data[1].oracle);
  });
});
