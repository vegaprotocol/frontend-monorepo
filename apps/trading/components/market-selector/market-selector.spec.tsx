import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketSelector } from './market-selector';
import { useMarketList } from '@vegaprotocol/markets';
import { createMarketFragment } from '@vegaprotocol/mock';
import { MarketState } from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { SortType } from './sort-dropdown';
import { SortTypeMapping } from './sort-dropdown';
import { Sort } from './sort-dropdown';
import { subDays } from 'date-fns';
import { isMarketActive } from '../../lib/utils';

jest.mock('@vegaprotocol/markets');
const mockUseMarketList = useMarketList as jest.Mock;

// mock market list items to avoid subscriptions starting
jest.mock('./market-selector-item', () => ({
  MarketSelectorItem: (props: { market: { id: string } }) => (
    <div data-testid={props.market.id} />
  ),
}));

// without a real DOM auto-size won't render with an actual height or width
jest.mock('react-virtualized-auto-sizer', () => {
  // eslint-disable-next-line react/display-name
  return ({
    children,
  }: {
    children: (size: { width: number; height: number }) => ReactNode;
  }) => <div>{children({ width: 300, height: 1000 })}</div>;
});

describe('MarketSelector', () => {
  const markets = [
    createMarketFragment({
      id: 'market-0',
      tradableInstrument: {
        instrument: {
          code: 'a',
          name: 'a',
          product: {
            __typename: 'Future',
            settlementAsset: {
              id: 'asset-0',
            },
          },
        },
      },
      // @ts-ignore candles get joined outside this type
      candles: [{ close: '100' }, { close: '200' }],
      marketTimestamps: {
        open: subDays(new Date(), 1).toISOString(),
      },
    }),
    createMarketFragment({
      id: 'market-1',
      state: MarketState.STATE_SUSPENDED,
      tradableInstrument: {
        instrument: {
          code: 'b',
          name: 'b',
          product: {
            __typename: 'Future',
            settlementAsset: {
              id: 'asset-0',
            },
          },
        },
      },
      // @ts-ignore candles get joined outside this type
      candles: [{ close: '100' }, { close: '400' }],
      marketTimestamps: {
        open: subDays(new Date(), 2).toISOString(),
      },
    }),
    createMarketFragment({
      id: 'market-2',
      state: MarketState.STATE_CLOSED,
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
      state: MarketState.STATE_ACTIVE,
      tradableInstrument: {
        instrument: {
          code: 'c',
          name: 'c',
          product: {
            __typename: 'Future',
            settlementAsset: {
              id: 'asset-1',
            },
          },
        },
      },
      // @ts-ignore candles get joined outside this type
      candles: [{ close: '100' }, { close: '1000' }],
      marketTimestamps: {
        open: subDays(new Date(), 0).toISOString(),
      },
    }),
    createMarketFragment({
      id: 'market-4',
      tradableInstrument: {
        instrument: {
          code: 'cd',
          name: 'cd',
          product: {
            __typename: 'Perpetual',
            settlementAsset: {
              id: 'asset-2',
            },
          },
        },
      },
      // @ts-ignore candles get joined outside this type
      candles: [{ close: '100' }, { close: '300' }],
      marketTimestamps: {
        open: subDays(new Date(), 3).toISOString(),
      },
    }),
  ];

  const activeMarkets = markets.filter((m) => isMarketActive(m.state));
  mockUseMarketList.mockReturnValue({
    data: markets,
    loading: false,
    error: undefined,
    reload: jest.fn(),
  });

  it('Button "All" should be selected by default', () => {
    const buttons = ['All', 'Futures', 'Spot', 'Perpetuals'];
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );
    screen
      .getAllByTestId(/^product-(All|Future|Spot|Perpetual)$/)
      .forEach((elem, i) => {
        expect(elem.textContent).toEqual(buttons[i]);
      });
  });

  it('renders only active markets', () => {
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );
    expect(screen.getAllByTestId(/market-\d/)).toHaveLength(
      activeMarkets.length
    );
  });

  it('filters by product type', async () => {
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId('product-Spot'));
    expect(screen.queryAllByTestId(/market-\d/)).toHaveLength(0);
    expect(screen.getByTestId('no-items')).toHaveTextContent(
      'Spot markets coming soon.'
    );

    await userEvent.click(screen.getByTestId('product-Perpetual'));
    expect(screen.queryAllByTestId(/market-\d/)).toHaveLength(1);

    await userEvent.click(screen.getByTestId('product-Future'));
    expect(screen.queryAllByTestId(/market-\d/)).toHaveLength(3);
    expect(screen.queryByTestId('no-items')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('product-All'));
    expect(screen.queryAllByTestId(/market-\d/)).toHaveLength(4);
    expect(screen.queryByTestId('no-items')).not.toBeInTheDocument();
  });

  it('filters by search term', async () => {
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByTestId('search-term'), 'zzz');
    expect(screen.getByTestId('no-items')).toHaveTextContent('No markets');
    const input = screen.getByTestId('search-term');
    await userEvent.clear(input);
    await userEvent.type(input, 'a');
    expect(input).toHaveValue('a');
    expect(screen.getAllByTestId(/market-\d/)).toHaveLength(1);
    expect(screen.getByTestId('market-0')).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'b');
    expect(screen.getAllByTestId(/market-\d/)).toHaveLength(1);
    expect(screen.getByTestId('market-1')).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'c');
    expect(screen.getAllByTestId(/market-\d/)).toHaveLength(2);
    expect(screen.getByTestId('market-3')).toBeInTheDocument();
    expect(screen.getByTestId('market-4')).toBeInTheDocument();
  });

  it('sorts by gained', async () => {
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId('sort-trigger'));
    const options = screen.getAllByTestId(/sort-item/);
    expect(options.map((o) => o.textContent?.trim())).toEqual(
      Object.entries(Sort).map(([key]) => SortTypeMapping[key as SortType])
    );
    await userEvent.click(screen.getByTestId('sort-item-Gained'));
    expect(
      screen
        .getAllByTestId(/market-\d/)
        .map((el) => el.getAttribute('data-testid'))
    ).toEqual([markets[3].id, markets[1].id, markets[4].id, markets[0].id]);
  });

  it('sorts by lost', async () => {
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId('sort-trigger'));
    await userEvent.click(screen.getByTestId('sort-item-Lost'));
    expect(
      screen
        .getAllByTestId(/market-\d/)
        .map((el) => el.getAttribute('data-testid'))
    ).toEqual([markets[0].id, markets[4].id, markets[1].id, markets[3].id]);
  });

  it('sorts by new', async () => {
    render(
      <MemoryRouter>
        <MarketSelector currentMarketId="market-0" onSelect={jest.fn()} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId('sort-trigger'));
    await userEvent.click(screen.getByTestId('sort-item-New'));
    expect(
      screen
        .getAllByTestId(/market-\d/)
        .map((el) => el.getAttribute('data-testid'))
    ).toEqual([markets[3].id, markets[0].id, markets[1].id, markets[4].id]);
  });
});
