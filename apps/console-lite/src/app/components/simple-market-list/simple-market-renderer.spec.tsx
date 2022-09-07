import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MarketNameRenderer from './simple-market-renderer';
import type { MarketNames_markets } from '@vegaprotocol/deal-ticket';
import { MarketState } from '@vegaprotocol/types';

describe('SimpleMarketRenderer', () => {
  const market = {
    id: 'marketId',
    name: 'Market Name',
    state: MarketState.STATE_ACTIVE,
    tradableInstrument: {
      instrument: {
        code: 'Market code',
        product: {
          quoteName: 'Quote name',
        },
        metadata: {
          tags: null,
        },
      },
    },
  } as MarketNames_markets;

  it('should properly render not mobile', () => {
    render(<MarketNameRenderer market={market} isMobile={false} />);
    expect(screen.getByText('Market Name')).toBeInTheDocument();
    expect(screen.getByText('Quote name')).toBeInTheDocument();
  });

  it('should properly render mobile', () => {
    render(<MarketNameRenderer market={market} isMobile={true} />);
    expect(screen.getByText('Market code')).toBeInTheDocument();
    expect(screen.getByText('Quote name')).toBeInTheDocument();
  });
});
