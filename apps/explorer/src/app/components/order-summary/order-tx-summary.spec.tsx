import type { MockedResponse } from '@apollo/client/testing';
import type { components } from '../../../types/explorer';
import type { UnknownObject } from '../nested-data-list';

import { MockedProvider } from '@apollo/client/testing';
import OrderTxSummary from './order-tx-summary';
import { render } from '@testing-library/react';
import { ExplorerMarketDocument } from '../links/market-link/__generated__/Market';

type Order = components['schemas']['v1OrderSubmission'];

function renderComponent(order: Order, mocks?: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks}>
      <OrderTxSummary order={order} />
    </MockedProvider>
  );
}
describe('Order TX Summary component', () => {
  it('Renders nothing if the order passed is somehow null', () => {
    const res = renderComponent({} as UnknownObject as Order);
    expect(res.queryByTestId('order-summary')).not.toBeInTheDocument();
  });

  it('Renders nothing if the order passed lacks a side', () => {
    const o: Order = {
      marketId: '123',
      price: '100',
      type: 'TYPE_LIMIT',
      size: '10',
    };
    const res = renderComponent(o);
    expect(res.queryByTestId('order-summary')).not.toBeInTheDocument();
  });

  it('Renders nothing if the order passed lacks a price', () => {
    const o: Order = {
      marketId: '123',
      side: 'SIDE_BUY',
      type: 'TYPE_LIMIT',
      size: '10',
    };
    const res = renderComponent(o);
    expect(res.queryByTestId('order-summary')).not.toBeInTheDocument();
  });

  it('Renders nothing if the order has an unspecified side', () => {
    const o: Order = {
      marketId: '123',
      side: 'SIDE_UNSPECIFIED',
      type: 'TYPE_LIMIT',
      size: '10',
      price: '10',
    };

    const res = renderComponent(o);
    expect(res.queryByTestId('order-summary')).not.toBeInTheDocument();
  });

  it('Renders nothing if the order has an unspecified market', () => {
    const o: Order = {
      side: 'SIDE_BUY',
      type: 'TYPE_LIMIT',
      size: '10',
      price: '10',
    };

    const res = renderComponent(o);
    expect(res.queryByTestId('order-summary')).not.toBeInTheDocument();
  });

  it('side, size and price in market if all details are present', async () => {
    const o: Order = {
      marketId: '123',
      side: 'SIDE_BUY',
      type: 'TYPE_LIMIT',
      size: '10',
      price: '333',
    };

    const mock = {
      request: {
        query: ExplorerMarketDocument,
        variables: {
          id: '123',
        },
      },
      result: {
        data: {
          market: {
            id: '123',
            decimalPlaces: 2,
            positionDecimalPlaces: 2,
            state: 'irrelevant-test-data',
            tradableInstrument: {
              instrument: {
                name: 'TEST',
                product: {
                  __typename: 'Future',
                  quoteName: 'TEST',
                  settlementAsset: {
                    __typeName: 'SettlementAsset',
                    decimals: 18,
                  },
                },
              },
            },
          },
        },
      },
    };
    const res = renderComponent(o, [mock]);
    expect(res.queryByTestId('order-summary')).toBeInTheDocument();
    expect(res.getByText('Buy')).toBeInTheDocument();

    // Initially renders price and size unformatted
    expect(res.getByText('333')).toBeInTheDocument();
    expect(res.getByText('10')).toBeInTheDocument();

    // After fetch renders formatted price and asset quotename
    expect(await res.findByText('3.33')).toBeInTheDocument();
    expect(await res.findByText('TEST')).toBeInTheDocument();
    expect(await res.getByText('0.10')).toBeInTheDocument();
  });
});
