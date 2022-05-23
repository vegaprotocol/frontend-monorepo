import React from 'react';
import { render, screen } from '@testing-library/react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { MarketState } from '@vegaprotocol/types';
import SimpleMarketList from './simple-market-list';
import type { SimpleMarkets_markets } from './__generated__/SimpleMarkets';

jest.mock('./data-provider', () => jest.fn());

jest.mock('@vegaprotocol/react-helpers', () => ({
  useDataProvider: jest.fn(),
  t: (txt: string) => txt,
}));

describe('SimpleMarketList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be properly renderer as empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useDataProvider as unknown as jest.SpyInstance<any>).mockImplementation(
      () => ({ data: [], error: false, loading: false })
    );
    render(<SimpleMarketList />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('should be properly rendered with some data', () => {
    const data = [
      {
        id: '1',
        data: {
          market: {
            state: MarketState.Active,
          },
        },
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                symbol: 'tUSD',
              },
            },
            metadata: {
              tags: [],
            },
          },
        },
      },
      {
        id: '2',
        data: {
          market: {
            state: MarketState.Proposed,
          },
        },
        tradableInstrument: {
          instrument: {
            product: {
              settlementAsset: {
                symbol: 'ETH',
              },
            },
            metadata: {
              tags: [],
            },
          },
        },
      },
    ] as unknown as SimpleMarkets_markets[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useDataProvider as unknown as jest.SpyInstance<any>).mockImplementation(
      () => ({ data, error: false, loading: false })
    );
    render(<SimpleMarketList />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
