import { CandlesChartContainer } from './candles-chart';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { CandlesEventsDocument } from './__generated__/Candles';
import type { CandlesEventsSubscription } from './__generated__/Candles';

const candles: CandlesEventsSubscription = {
  candles: {
    lastUpdateInPeriod: 0,
    periodStart: 0,
    open: '0',
    high: '0',
    low: '0',
    close: '0',
    volume: '0',
  },
};
const mocks = [
  {
    request: {
      query: CandlesEventsDocument,
      variables: { marketId: 'market-id', interval: 'INTERVAL_I15M' },
    },
    result: { data: candles },
  },
];

describe('TradingChart', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockedProvider>
        <VegaWalletContext.Provider value={{} as never}>
          <CandlesChartContainer marketId={'market-id'} />
        </VegaWalletContext.Provider>
      </MockedProvider>
    );
    expect(baseElement).toBeTruthy();
  });

  it('volume study should be preselected', async () => {
    act(() => {
      render(
        <MockedProvider mocks={mocks}>
          <VegaWalletContext.Provider value={{} as never}>
            <CandlesChartContainer marketId={'market-id'} />
          </VegaWalletContext.Provider>
        </MockedProvider>
      );
    });
    await waitFor(() => {
      expect(
        screen.getByText('Studies', {
          selector: '[type="button"]',
        })
      ).toBeInTheDocument();
    });
    act(() => {
      userEvent.click(
        screen.getByText('Studies', {
          selector: '[type="button"]',
        })
      );
    });
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
    expect(screen.getByText('Volume')).toHaveAttribute('data-state', 'checked');
  });
});
