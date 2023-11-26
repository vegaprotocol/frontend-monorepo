import { render, screen } from '@testing-library/react';
import { ChartContainer } from './chart-container';
import { useCandlesChartSettingsStore } from './use-candles-chart-settings';

jest.mock('@vegaprotocol/candles-chart', () => ({
  CandlesChartContainer: ({ marketId }: { marketId: string }) => (
    <div data-testid="pennant">{marketId}</div>
  ),
}));

jest.mock('@vegaprotocol/trading-view', () => ({
  TradingViewContainer: ({ marketId }: { marketId: string }) => (
    <div data-testid="tradingview">{marketId}</div>
  ),
}));

describe('ChartContainer', () => {
  it('shows tradingview chart', () => {
    useCandlesChartSettingsStore.setState({
      chartlib: 'tradingview',
    });

    const marketId = 'market-id';

    render(<ChartContainer marketId={marketId} />);

    expect(screen.getByTestId('tradingview')).toHaveTextContent(marketId);
  });

  it('shows pennant chart', () => {
    useCandlesChartSettingsStore.setState({
      chartlib: 'pennant',
    });

    const marketId = 'market-id';

    render(<ChartContainer marketId={marketId} />);

    expect(screen.getByTestId('pennant')).toHaveTextContent(marketId);
  });
});
