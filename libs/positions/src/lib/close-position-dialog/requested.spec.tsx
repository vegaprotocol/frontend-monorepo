import { render, screen, within } from '@testing-library/react';
import { Schema } from '@vegaprotocol/types';
import * as dataHook from '../use-request-close-position-data';
import { Requested } from './requested';

jest.mock('./use-request-close-position-data');

describe('Close position dialog - Request', () => {
  const props = {
    partyId: 'party-id',
    order: {
      marketId: 'market-id',
      type: Schema.OrderType.TYPE_MARKET as const,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK as const,
      side: Schema.Side.SIDE_BUY,
      size: '10',
    },
  };

  it('loading state', async () => {
    jest.spyOn(dataHook, 'useRequestClosePositionData').mockReturnValue({
      loading: false,
      market: null,
      marketData: null,
      orders: [],
    });
    render(<Requested {...props} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders message if no closing order found', async () => {
    const orders = [
      {
        size: '200',
        price: '999',
        side: Schema.Side.SIDE_BUY,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      },
      {
        size: '300',
        price: '888',
        side: Schema.Side.SIDE_SELL,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      },
    ];
    jest.spyOn(dataHook, 'useRequestClosePositionData').mockReturnValue({
      market: {
        decimalPlaces: 2,
        positionDecimalPlaces: 2,
        tradableInstrument: {
          instrument: {
            name: 'test market',
            product: {
              // @ts-ignore avoiding having to add every property on the type
              settlementAsset: {
                symbol: 'SYM',
              },
            },
          },
        },
      },
      // @ts-ignore avoid all fields
      marketData: {
        markPrice: '100',
      },
      // @ts-ignore avoid all fields
      orders,
    });
    render(<Requested {...props} />);

    // closing order
    const closingOrderHeader = screen.getByText('Position to be closed');
    const closingOrderTable = within(
      closingOrderHeader.nextElementSibling?.querySelector(
        'tbody'
      ) as HTMLElement
    );
    const closingOrderRow = closingOrderTable.getAllByRole('row');
    expect(closingOrderRow[0].children[0]).toHaveTextContent('test market');
    expect(closingOrderRow[0].children[1]).toHaveTextContent('+0.1');
    expect(closingOrderRow[0].children[2]).toHaveTextContent('~1.00 SYM');

    // orders
    const ordersHeading = screen.getByText('Orders to be closed');
    const ordersTable = within(
      ordersHeading.nextElementSibling?.querySelector('tbody') as HTMLElement
    );
    const orderRows = ordersTable.getAllByRole('row');
    expect(orderRows).toHaveLength(orders.length);
    expect(orderRows[0].children[0]).toHaveTextContent('+2');
    expect(orderRows[0].children[1]).toHaveTextContent('9.99 SYM');
    expect(orderRows[0].children[2]).toHaveTextContent(
      "Good 'til Cancelled (GTC)"
    );

    expect(orderRows[1].children[0]).toHaveTextContent('-3');
    expect(orderRows[1].children[1]).toHaveTextContent('8.88 SYM');
    expect(orderRows[1].children[2]).toHaveTextContent(
      "Good 'til Cancelled (GTC)"
    );
  });
});
