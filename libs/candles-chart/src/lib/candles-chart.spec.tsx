import { CandlesChartContainer } from './candles-chart';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { VegaWalletContext } from '@vegaprotocol/wallet';

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
        <MockedProvider>
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
