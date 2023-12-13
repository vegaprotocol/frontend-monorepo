import { render, screen } from '@testing-library/react';
import { ChartContainer } from './chart-container';
import { useChartSettingsStore } from './use-chart-settings';
import { useEnvironment } from '@vegaprotocol/environment';

jest.mock('@vegaprotocol/candles-chart', () => ({
  ...jest.requireActual('@vegaprotocol/candles-chart'),
  CandlesChartContainer: ({ marketId }: { marketId: string }) => (
    <div data-testid="pennant">{marketId}</div>
  ),
}));

jest.mock('@vegaprotocol/trading-view', () => ({
  ...jest.requireActual('@vegaprotocol/trading-view'),
  TradingViewContainer: ({ marketId }: { marketId: string }) => (
    <div data-testid="tradingview">{marketId}</div>
  ),
}));

describe('ChartContainer', () => {
  it('renders pennant if no library path is set', () => {
    useChartSettingsStore.setState({
      chartlib: 'tradingview',
    });

    useEnvironment.setState({
      CHARTING_LIBRARY_PATH: undefined,
      CHARTING_LIBRARY_HASH: undefined,
    });

    const marketId = 'market-id';

    render(<ChartContainer marketId={marketId} />);

    expect(screen.getByTestId('pennant')).toHaveTextContent(marketId);
  });

  it('renders trading view if library path is set', () => {
    useChartSettingsStore.setState({
      chartlib: 'tradingview',
    });

    useEnvironment.setState({
      CHARTING_LIBRARY_PATH: 'dummy-path',
      CHARTING_LIBRARY_HASH: 'hash',
    });

    const marketId = 'market-id';

    render(<ChartContainer marketId={marketId} />);

    expect(screen.getByTestId('tradingview')).toHaveTextContent(marketId);
  });

  it('renders pennant chart if stored in settings', () => {
    useChartSettingsStore.setState({
      chartlib: 'pennant',
    });

    const marketId = 'market-id';

    render(<ChartContainer marketId={marketId} />);

    expect(screen.getByTestId('pennant')).toHaveTextContent(marketId);
  });
});
