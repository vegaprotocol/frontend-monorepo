import { VegaWalletContext } from '@vegaprotocol/wallet';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { DealTicket } from './deal-ticket';
import type { DealTicketMarketFragment } from './__generated___/DealTicket';
import { Schema } from '@vegaprotocol/types';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ChainIdQuery } from '@vegaprotocol/react-helpers';
import { ChainIdDocument, addDecimal } from '@vegaprotocol/react-helpers';

const market: DealTicketMarketFragment = {
  __typename: 'Market',
  id: 'market-id',
  decimalPlaces: 2,
  positionDecimalPlaces: 1,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  state: Schema.MarketState.STATE_ACTIVE,
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: '1',
      name: 'Instrument name',
      product: {
        __typename: 'Future',
        quoteName: 'quote-name',
        settlementAsset: {
          __typename: 'Asset',
          id: 'asset-id',
          name: 'asset-name',
          symbol: 'asset-symbol',
          decimals: 2,
        },
      },
    },
  },
  fees: {
    factors: {
      makerFee: '0.001',
      infrastructureFee: '0.002',
      liquidityFee: '0.003',
    },
  },
  depth: {
    __typename: 'MarketDepth',
    lastTrade: {
      __typename: 'Trade',
      price: '100',
    },
  },
};
const submit = jest.fn();
const transactionStatus = 'default';

const mockChainId = 'chain-id';

function generateJsx(order?: OrderSubmissionBody['orderSubmission']) {
  const chainIdMock: MockedResponse<ChainIdQuery> = {
    request: {
      query: ChainIdDocument,
    },
    result: {
      data: {
        statistics: {
          chainId: mockChainId,
        },
      },
    },
  };
  return (
    <MockedProvider mocks={[chainIdMock]}>
      <VegaWalletContext.Provider value={{} as any}>
        <DealTicket
          defaultOrder={order}
          market={market}
          submit={submit}
          transactionStatus={transactionStatus}
        />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
}

describe('DealTicket', () => {
  it('should display ticket defaults', () => {
    render(generateJsx());

    // Assert defaults are used
    expect(
      screen.getByTestId(`order-type-${Schema.OrderType.TYPE_MARKET}`)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();
    expect(
      screen.queryByTestId('order-side-SIDE_SELL')?.querySelector('input')
    ).not.toBeChecked();
    expect(screen.getByTestId('order-size')).toHaveDisplayValue(
      String(1 / Math.pow(10, market.positionDecimalPlaces))
    );
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Assert last price is shown
    expect(screen.getByTestId('last-price')).toHaveTextContent(
      // eslint-disable-next-line
      `~${addDecimal(market.depth.lastTrade!.price, market.decimalPlaces)} ${
        market.tradableInstrument.instrument.product.quoteName
      }`
    );
  });

  it('can edit deal ticket', async () => {
    render(generateJsx());

    // BUY is selected by default
    expect(
      screen.getByTestId('order-side-SIDE_BUY')?.querySelector('input')
    ).toBeChecked();

    await act(async () => {
      fireEvent.change(screen.getByTestId('order-size'), {
        target: { value: '200' },
      });
    });

    expect(screen.getByTestId('order-size')).toHaveDisplayValue('200');

    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch to limit order
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));

    // Check all TIF options shown
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );
  });

  it('handles TIF select box dependent on order type', () => {
    render(generateJsx());

    // Check only IOC and
    expect(
      Array.from(screen.getByTestId('order-tif').children).map(
        (o) => o.textContent
      )
    ).toEqual(['Fill or Kill (FOK)', 'Immediate or Cancel (IOC)']);

    // Switch to limit order and check all TIF options shown
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif').children).toHaveLength(
      Object.keys(Schema.OrderTimeInForce).length
    );

    // Change to GTC
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );

    // Switch back to market order and TIF should now be IOC
    fireEvent.click(screen.getByTestId('order-type-TYPE_MARKET'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_IOC
    );

    // Switch tif to FOK
    fireEvent.change(screen.getByTestId('order-tif'), {
      target: { value: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK },
    });
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_FOK
    );

    // Change back to limit and check we are still on FOK
    fireEvent.click(screen.getByTestId('order-type-TYPE_LIMIT'));
    expect(screen.getByTestId('order-tif')).toHaveValue(
      Schema.OrderTimeInForce.TIME_IN_FORCE_GTC
    );
  });
});
