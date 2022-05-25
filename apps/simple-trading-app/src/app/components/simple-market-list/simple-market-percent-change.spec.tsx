import React from 'react';
import { render, screen } from '@testing-library/react';
import { theme } from '@vegaprotocol/tailwindcss-config';
import SimpleMarketPercentChange from './simple-market-percent-change';
import type { SimpleMarkets_markets_candles } from './__generated__/SimpleMarkets';

describe('SimpleMarketPercentChange should parse proper change', () => {
  let candles: (SimpleMarkets_markets_candles | null)[] | null;
  it('empty array', () => {
    candles = [];
    render(<SimpleMarketPercentChange candles={candles} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('null', () => {
    candles = null;
    render(<SimpleMarketPercentChange candles={candles} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('an appreciated one', () => {
    candles = [
      { open: '50' } as SimpleMarkets_markets_candles,
      { close: '100' } as SimpleMarkets_markets_candles,
      null,
    ];
    render(<SimpleMarketPercentChange candles={candles} />);
    expect(screen.getByText('100.000%')).toBeInTheDocument();
    expect(screen.getByText('100.000%')).toHaveStyle(
      `color: ${theme.colors.vega.green}`
    );
  });
  it('a depreciated one', () => {
    candles = [
      { open: '100' } as SimpleMarkets_markets_candles,
      { close: '50' } as SimpleMarkets_markets_candles,
      null,
    ];
    render(<SimpleMarketPercentChange candles={candles} />);
    expect(screen.getByText('-50.000%')).toBeInTheDocument();
    expect(screen.getByText('-50.000%')).toHaveStyle(
      `color: ${theme.colors.vega.pink}`
    );
  });
});
