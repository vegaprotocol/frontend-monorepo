import { render, screen } from '@testing-library/react';
import { Side as vegaSide } from '@vegaprotocol/enums';

import { useMarketsStore } from '@/stores/markets-store';
import { mockStore } from '@/test-helpers/mock-store';

import { DerivativeSide, OrderSide, SpotSide } from './side';

jest.mock('@/stores/markets-store');

describe('DerivativeSide', () => {
  const renderComponent = (side: vegaSide) =>
    render(<DerivativeSide side={side} />);

  it('should render long for buy', () => {
    renderComponent(vegaSide.SIDE_BUY);
    expect(screen.getByText('Long')).toBeInTheDocument();
  });
  it('should render short for sell', () => {
    renderComponent(vegaSide.SIDE_SELL);
    expect(screen.getByText('Short')).toBeInTheDocument();
  });
});

describe('SpotSide', () => {
  const renderComponent = (side: vegaSide) => render(<SpotSide side={side} />);

  it('should render long for buy', () => {
    renderComponent(vegaSide.SIDE_BUY);
    expect(screen.getByText('Buy')).toBeInTheDocument();
  });
  it('should render short for sell', () => {
    renderComponent(vegaSide.SIDE_SELL);
    expect(screen.getByText('Sell')).toBeInTheDocument();
  });
});

describe('OrderSide', () => {
  const renderComponent = (side: vegaSide, marketId: string) =>
    render(<OrderSide side={side} marketId={marketId} />);

  it('should render long/short if loading', () => {
    mockStore(useMarketsStore, { loading: true });
    renderComponent(vegaSide.SIDE_BUY, '0'.repeat(64));
    expect(screen.getByText('Long')).toBeInTheDocument();
  });
  it('should render long/short if marketId is undefined', () => {
    mockStore(useMarketsStore, { loading: false });
    renderComponent(vegaSide.SIDE_BUY, '');
    expect(screen.getByText('Long')).toBeInTheDocument();
  });

  it('should render long for non-spot market buy', () => {
    mockStore(useMarketsStore, { loading: false, getMarketById: () => ({}) });
    renderComponent(vegaSide.SIDE_BUY, '0'.repeat(64));
    expect(screen.getByText('Long')).toBeInTheDocument();
  });
  it('should render short for non-spot market sell', () => {
    mockStore(useMarketsStore, { loading: false, getMarketById: () => ({}) });
    renderComponent(vegaSide.SIDE_SELL, '0'.repeat(64));
    expect(screen.getByText('Short')).toBeInTheDocument();
  });

  it('should render buy for spot market buy', () => {
    mockStore(useMarketsStore, {
      loading: false,
      getMarketById: () => ({
        tradableInstrument: { instrument: { spot: {} } },
      }),
    });
    renderComponent(vegaSide.SIDE_BUY, '0'.repeat(64));
    expect(screen.getByText('Buy')).toBeInTheDocument();
  });
  it('should render sell for spot market sell', () => {
    mockStore(useMarketsStore, {
      loading: false,
      getMarketById: () => ({
        tradableInstrument: { instrument: { spot: {} } },
      }),
    });
    renderComponent(vegaSide.SIDE_SELL, '0'.repeat(64));
    expect(screen.getByText('Sell')).toBeInTheDocument();
  });
});
