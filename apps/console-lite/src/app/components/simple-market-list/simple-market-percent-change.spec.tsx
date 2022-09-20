import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import SimpleMarketPercentChange from './simple-market-percent-change';
import type { Candle } from '@vegaprotocol/market-list';

describe('SimpleMarketPercentChange should parse proper change', () => {
  let candles: (Candle | null)[] | null;
  const setValue = () => undefined;
  it('empty array', () => {
    candles = [];
    render(
      <MockedProvider>
        <SimpleMarketPercentChange
          candles={candles}
          marketId={'1'}
          setValue={setValue}
        />
      </MockedProvider>
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('null', () => {
    candles = null;
    render(
      <MockedProvider>
        <SimpleMarketPercentChange
          candles={candles}
          marketId={'1'}
          setValue={setValue}
        />
      </MockedProvider>
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('an appreciated one', () => {
    candles = [{ open: '50' } as Candle, { close: '100' } as Candle, null];
    render(
      <MockedProvider>
        <SimpleMarketPercentChange
          candles={candles}
          marketId={'1'}
          setValue={setValue}
        />
      </MockedProvider>
    );
    expect(screen.getByText('100.000%')).toBeInTheDocument();
    expect(screen.getByText('100.000%')).toHaveClass(
      'text-darkerGreen dark:text-lightGreen'
    );
  });
  it('a depreciated one', () => {
    candles = [{ open: '100' } as Candle, { close: '50' } as Candle, null];
    render(
      <MockedProvider>
        <SimpleMarketPercentChange
          candles={candles}
          marketId={'1'}
          setValue={setValue}
        />
      </MockedProvider>
    );
    expect(screen.getByText('50.000%')).toBeInTheDocument();
    expect(screen.getByText('50.000%')).toHaveClass('text-vega-pink');
  });
});
