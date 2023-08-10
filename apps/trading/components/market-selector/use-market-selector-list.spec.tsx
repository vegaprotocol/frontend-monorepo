import merge from 'lodash/merge';
import { renderHook } from '@testing-library/react';
import {
  isMarketActive,
  useMarketSelectorList,
} from './use-market-selector-list';
import { Product } from '../../components/market-selector/product-selector';
import { Sort } from './sort-dropdown';
import { createMarketFragment } from '@vegaprotocol/mock';
import { MarketState } from '@vegaprotocol/types';
import { useMarketList } from '@vegaprotocol/markets';
import type { Filter } from '../../components/market-selector';
import { subDays } from 'date-fns';

jest.mock('@vegaprotocol/markets');
const mockUseMarketList = useMarketList as jest.Mock;

describe('useMarketSelectorList', () => {
  const setup = (initialArgs?: Partial<Filter>) => {
    const defaultArgs: Filter = {
      searchTerm: '',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    };
    return renderHook((args) => useMarketSelectorList(args), {
      initialProps: merge(defaultArgs, initialArgs),
    });
  };

  it('returns all markets active and suspended markets', () => {
    const markets = [
      createMarketFragment({ id: 'market-0' }),
      createMarketFragment({
        id: 'market-1',
        state: MarketState.STATE_SUSPENDED,
      }),
      createMarketFragment({
        id: 'market-2',
        state: MarketState.STATE_CLOSED,
      }),
      createMarketFragment({
        id: 'market-3',
        state: MarketState.STATE_CLOSED,
      }),
      createMarketFragment({
        id: 'market-4',
        state: MarketState.STATE_PENDING,
      }),
    ];
    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result } = setup();
    const expectedFilteredMarkets = markets.filter((m) =>
      isMarketActive(m.state)
    );
    expect(result.current).toEqual({
      data: markets,
      markets: expectedFilteredMarkets,
      loading: false,
      error: undefined,
    });
  });

  it('filters by product', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-1',
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Spot' as 'Future', // spot isn't in schema yet
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-2',
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Perpetual' as 'Future', // spot isn't in schema yet
            },
          },
        },
      }),
    ];

    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result, rerender } = setup();
    expect(result.current.markets).toEqual([markets[0]]);
    rerender({
      searchTerm: '',
      product: Product.Spot as 'Future',
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[1]]);
    rerender({
      searchTerm: '',
      product: Product.Perpetual as 'Future',
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[2]]);
    rerender({
      searchTerm: '',
      product: Product.All,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual(markets);
  });

  it('filters by asset', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                id: 'asset-0',
              },
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-1',
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                id: 'asset-0',
              },
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-2',
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                id: 'asset-1',
              },
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-3',
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                id: 'asset-2',
              },
            },
          },
        },
      }),
    ];

    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result, rerender } = setup({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.None,
      assets: ['asset-0'],
    });
    expect(result.current.markets).toEqual([markets[0], markets[1]]);

    rerender({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.None,
      assets: ['asset-0', 'asset-1'],
    });

    expect(result.current.markets).toEqual([
      markets[0],
      markets[1],
      markets[2],
    ]);

    rerender({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.None,
      assets: ['asset-0', 'asset-1', 'asset-2'],
    });

    // all assets selected
    expect(result.current.markets).toEqual(markets);

    rerender({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.None,
      assets: ['asset-invalid'],
    });

    expect(result.current.markets).toEqual([]);
  });

  it('filters by search term', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        tradableInstrument: {
          instrument: {
            code: 'abc',
            name: 'aaa',
          },
        },
      }),
      createMarketFragment({
        id: 'market-1',
        tradableInstrument: {
          instrument: {
            code: 'def',
            name: 'ggg',
          },
        },
      }),
      createMarketFragment({
        id: 'market-2',
        tradableInstrument: {
          instrument: {
            code: 'defg',
            name: 'gggh',
          },
        },
      }),
      createMarketFragment({
        id: 'market-3',
        tradableInstrument: {
          instrument: {
            code: 'ggg',
            name: 'foo',
          },
        },
      }),
    ];

    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result, rerender } = setup({
      searchTerm: 'abc',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[0]]);
    rerender({
      searchTerm: 'def',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[1], markets[2]]);
    rerender({
      searchTerm: 'defg',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[2]]);
    rerender({
      searchTerm: 'zzz',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([]);

    // by name
    rerender({
      searchTerm: 'aaa',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[0]]);
    rerender({
      searchTerm: 'ggg',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([
      markets[1],
      markets[2],
      markets[3],
    ]);
  });

  it('sorts by state and volume by default', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        state: MarketState.STATE_PENDING,
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '200',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-1',
        state: MarketState.STATE_ACTIVE,
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '200',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-2',
        state: MarketState.STATE_ACTIVE,
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '100',
          },
        ],
      }),
      createMarketFragment({
        state: MarketState.STATE_PENDING,
        id: 'market-3',
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '100',
          },
        ],
      }),
    ];

    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });

    const { result } = setup({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.None,
      assets: [],
    });
    expect(result.current.markets).toEqual([
      markets[1],
      markets[2],
      markets[0],
      markets[3],
    ]);
  });

  it('sorts by gained', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        // @ts-ignore actual fragment doesnt contain candles and is joined later
        candles: [
          {
            close: '100',
          },
          {
            close: '200',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-1',
        // @ts-ignore actual fragment doesnt contain candles and is joined later
        candles: [
          {
            close: '100',
          },
          {
            close: '1000',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore actual fragment doesnt contain candles and is joined later
        candles: [
          {
            close: '100',
          },
          {
            close: '400',
          },
        ],
      }),
    ];
    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result, rerender } = setup({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.Gained,
      assets: [],
    });
    expect(result.current.markets).toEqual([
      markets[1],
      markets[2],
      markets[0],
    ]);
    rerender({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.Lost as 'Gained',
      assets: [],
    });
    expect(result.current.markets).toEqual([
      markets[0],
      markets[2],
      markets[1],
    ]);
  });

  it('sorts by open timestamp', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        marketTimestamps: {
          open: subDays(new Date(), 3).toISOString(),
        },
      }),
      createMarketFragment({
        id: 'market-1',
        marketTimestamps: {
          open: subDays(new Date(), 1).toISOString(),
        },
      }),
      createMarketFragment({
        id: 'market-2',
        marketTimestamps: {
          open: subDays(new Date(), 2).toISOString(),
        },
      }),
    ];
    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result } = setup({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.New,
      assets: [],
    });
    expect(result.current.markets).toEqual([
      markets[1],
      markets[2],
      markets[0],
    ]);
  });
});
