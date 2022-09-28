import { act, render, screen } from '@testing-library/react';
import { addDecimal, getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { OrderType } from '@vegaprotocol/types';
import {
  OrderRejectionReasonMapping,
  OrderTimeInForceMapping,
} from '@vegaprotocol/types';
import {
  OrderStatus,
  OrderRejectionReason,
  OrderTypeMapping,
  OrderStatusMapping,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

import { OrderListTable } from '../';
import type { Order } from '../';
import { limitOrder, marketOrder } from '../mocks/generate-orders';

const generateJsx = (
  orders: Order[] | null,
  context: PartialDeep<VegaWalletContextShape> = { keypair: { pub: '0x123' } }
) => {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
        <OrderListTable
          rowData={orders}
          cancel={jest.fn()}
          setEditOrder={jest.fn()}
        />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

describe('OrderListTable', () => {
  it('should show no orders message', async () => {
    await act(async () => {
      render(generateJsx([]));
    });
    expect(screen.getByText('No orders')).toBeInTheDocument();
  });

  it('should render correct columns', async () => {
    await act(async () => {
      render(generateJsx([marketOrder, limitOrder]));
    });

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(11);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'Market',
      'Size',
      'Type',
      'Status',
      'Filled',
      'Price',
      'Time In Force',
      'Created At',
      'Updated At',
      'Edit',
      'Cancel',
    ]);
  });

  it('should apply correct formatting for market order', async () => {
    await act(async () => {
      render(generateJsx([marketOrder]));
    });

    const cells = screen.getAllByRole('gridcell');
    const expectedValues: string[] = [
      marketOrder.market?.tradableInstrument.instrument.code || '',
      '+0.10',
      OrderTypeMapping[marketOrder.type as OrderType] || '',
      OrderStatusMapping[marketOrder.status],
      '5',
      '-',
      OrderTimeInForceMapping[marketOrder.timeInForce],
      getDateTimeFormat().format(new Date(marketOrder.createdAt)),
      '-',
      'Edit',
      'Cancel',
    ];
    cells.forEach((cell, i) =>
      expect(cell).toHaveTextContent(expectedValues[i])
    );
  });

  it('should apply correct formatting applied for GTT limit order', async () => {
    await act(async () => {
      render(generateJsx([limitOrder]));
    });
    const cells = screen.getAllByRole('gridcell');

    const expectedValues: string[] = [
      limitOrder.market?.tradableInstrument.instrument.code || '',
      '+0.10',
      OrderTypeMapping[limitOrder.type || OrderType.TYPE_LIMIT],
      OrderStatusMapping[limitOrder.status],
      '5',
      addDecimal(limitOrder.price, limitOrder.market?.decimalPlaces ?? 0),
      `${
        OrderTimeInForceMapping[limitOrder.timeInForce]
      }: ${getDateTimeFormat().format(new Date(limitOrder.expiresAt ?? ''))}`,
      getDateTimeFormat().format(new Date(limitOrder.createdAt)),
      '-',
      'Edit',
      'Cancel',
    ];
    cells.forEach((cell, i) =>
      expect(cell).toHaveTextContent(expectedValues[i])
    );
  });

  it('should apply correct formatting for a rejected order', async () => {
    const rejectedOrder = {
      ...marketOrder,
      status: OrderStatus.STATUS_REJECTED,
      rejectionReason:
        OrderRejectionReason.ORDER_ERROR_INSUFFICIENT_ASSET_BALANCE,
    };
    await act(async () => {
      render(generateJsx([rejectedOrder]));
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[3]).toHaveTextContent(
      `${OrderStatusMapping[rejectedOrder.status]}: ${
        OrderRejectionReasonMapping[rejectedOrder.rejectionReason]
      }`
    );
  });
});
