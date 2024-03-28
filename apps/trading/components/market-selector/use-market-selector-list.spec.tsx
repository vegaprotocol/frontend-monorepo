import merge from 'lodash/merge';
import { renderHook } from '@testing-library/react';
import { useMarketSelectorList } from './use-market-selector-list';
import { isMarketActive } from '../../lib/utils';
import { Product } from './product-selector';
import { Sort } from './sort-dropdown';
import {
  createMarketFragment,
  createMarketsDataFragment,
} from '@vegaprotocol/mock';
import { MarketState } from '@vegaprotocol/types';
import { useMarketList } from '@vegaprotocol/markets';
import type { Filter } from './market-selector';
import { subDays } from 'date-fns';

jest.mock('@vegaprotocol/markets', () => ({
  ...jest.requireActual('@vegaprotocol/markets'),
  useMarketList: jest.fn(),
}));
const mockUseMarketList = useMarketList as jest.Mock;

describe('useMarketSelectorList', () => {
  const setup = (initialArgs?: Partial<Filter>) => {
    const defaultArgs: Filter = {
      searchTerm: '',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: [],
    };
    return renderHook((args) => useMarketSelectorList(args), {
      initialProps: merge(defaultArgs, initialArgs),
    });
  };

  it('returns all markets active and suspended markets', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
      }),
      createMarketFragment({
        id: 'market-1',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_SUSPENDED,
        }),
      }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_CLOSED,
        }),
      }),
      createMarketFragment({
        id: 'market-3',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_CLOSED,
        }),
      }),
      createMarketFragment({
        id: 'market-4',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_PENDING,
        }),
      }),
    ];
    mockUseMarketList.mockReturnValue({
      data: markets,
      loading: false,
      error: undefined,
    });
    const { result } = setup();
    const expectedFilteredMarkets = markets.filter((m) =>
      // @ts-ignore candles get joined outside this type
      isMarketActive(m.data.marketState)
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
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
            },
          },
        },
      }),
      // createMarketFragment({
      //   id: 'market-1',
      //   tradableInstrument: {
      //     instrument: {
      //       product: {
      //         __typename: 'Spot',
      //       },
      //     },
      //   },
      // }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Perpetual',
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
    // rerender({
    //   searchTerm: '',
    //   product: Product.Spot as 'Future',
    //   sort: Sort.TopTraded,
    //   assets: [],
    // });
    // expect(result.current.markets).toEqual([markets[1]]);
    rerender({
      searchTerm: '',
      product: Product.Perpetual as 'Future',
      sort: Sort.TopTraded,
      assets: [],
    });
    // expect(result.current.markets).toEqual([markets[2]]);
    rerender({
      searchTerm: '',
      product: Product.All,
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual(markets);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('filters by asset', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: {
                id: 'asset-0',
              },
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-1',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: {
                id: 'asset-0',
              },
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: {
                id: 'asset-1',
              },
            },
          },
        },
      }),
      createMarketFragment({
        id: 'market-3',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
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
      sort: Sort.TopTraded,
      assets: ['asset-0'],
    });

    expect(result.current.markets).toEqual([markets[0], markets[1]]);

    rerender({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.TopTraded,
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
      sort: Sort.TopTraded,
      assets: ['asset-0', 'asset-1', 'asset-2'],
    });

    // all assets selected
    expect(result.current.markets).toEqual(markets);

    rerender({
      searchTerm: '',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: ['asset-invalid'],
    });

    expect(result.current.markets).toEqual([]);
  });

  it('filters by search term', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            code: 'abc',
            name: 'aaa',
          },
        },
      }),
      createMarketFragment({
        id: 'market-1',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            code: 'def',
            name: 'ggg',
          },
        },
      }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        tradableInstrument: {
          instrument: {
            code: 'defg',
            name: 'gggh',
          },
        },
      }),
      createMarketFragment({
        id: 'market-3',
        // @ts-ignore candles get joined outside this type
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
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
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[0]]);
    rerender({
      searchTerm: 'def',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[1], markets[2]]);
    rerender({
      searchTerm: 'defg',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[2]]);
    rerender({
      searchTerm: 'zzz',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual([]);

    // by name
    rerender({
      searchTerm: 'aaa',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual([markets[0]]);
    rerender({
      searchTerm: 'ggg',
      product: Product.Future,
      sort: Sort.TopTraded,
      assets: [],
    });
    expect(result.current.markets).toEqual([
      markets[1],
      markets[2],
      markets[3],
    ]);
  });

  it('sorts by top traded by default', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
          markPrice: '1',
        }),
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '200',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-1',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
          markPrice: '1',
        }),
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '100',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
          markPrice: '1',
        }),
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '300',
          },
        ],
      }),
      createMarketFragment({
        id: 'market-3',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
          markPrice: '1',
        }),
        // @ts-ignore candles not on fragment
        candles: [
          {
            volume: '400',
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
      sort: Sort.TopTraded,
      assets: [],
    });

    expect(result.current.markets).toEqual([
      markets[3],
      markets[2],
      markets[0],
      markets[1],
    ]);
  });

  it('sorts by gained', () => {
    const markets = [
      createMarketFragment({
        id: 'market-0',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        // @ts-ignore actual fragment doesn't contain candles and is joined later
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
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        // @ts-ignore actual fragment doesn't contain candles and is joined later
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
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        // @ts-ignore actual fragment doesn't contain candles and is joined later
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
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        marketTimestamps: {
          open: subDays(new Date(), 3).toISOString(),
        },
      }),
      createMarketFragment({
        id: 'market-1',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
        marketTimestamps: {
          open: subDays(new Date(), 1).toISOString(),
        },
      }),
      createMarketFragment({
        id: 'market-2',
        // @ts-ignore data not on fragment
        data: createMarketsDataFragment({
          marketState: MarketState.STATE_ACTIVE,
        }),
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
