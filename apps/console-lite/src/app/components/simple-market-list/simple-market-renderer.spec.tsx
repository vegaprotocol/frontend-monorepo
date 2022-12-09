import React from 'react';
import { render, screen } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import MarketNameRenderer from './simple-market-renderer';
import type { Market } from '@vegaprotocol/market-list';

describe('SimpleMarketRenderer', () => {
  const market = {
    id: 'MARKET_A',
    state: Schema.MarketState.STATE_ACTIVE,
    tradableInstrument: {
      instrument: {
        code: 'MARKET_A_CODE',
        name: 'MARKET_A_NAME',
        product: {
          quoteName: 'MARKET_A_QUOTE_NAME',
        },
        metadata: {
          tags: null,
        },
      },
    },
  } as Market;

  it('should properly render not mobile', () => {
    render(<MarketNameRenderer market={market} isMobile={false} />);
    expect(screen.getByText('MARKET_A_NAME')).toBeInTheDocument();
    expect(screen.getByText('MARKET_A_QUOTE_NAME')).toBeInTheDocument();
  });

  it('should properly render mobile', () => {
    render(<MarketNameRenderer market={market} isMobile={true} />);
    expect(screen.getByText('MARKET_A_CODE')).toBeInTheDocument();
    expect(screen.getByText('MARKET_A_QUOTE_NAME')).toBeInTheDocument();
  });
});
