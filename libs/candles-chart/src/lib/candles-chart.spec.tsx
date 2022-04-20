import { CandlesChartContainer } from './candles-chart';
import { render } from '@testing-library/react';
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
});
