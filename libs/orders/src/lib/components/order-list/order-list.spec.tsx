import { act, render, screen } from '@testing-library/react';
import {
  addDecimal,
  formatLabel,
  getDateTimeFormat,
} from '@vegaprotocol/react-helpers';
import type { Orders_party_orders } from '../__generated__/Orders';
import { OrderStatus, OrderRejectionReason } from '@vegaprotocol/types';
import { OrderListTable } from './order-list';
import type { PartialDeep } from 'type-fest';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';
import { limitOrder, marketOrder } from '../mocks/generate-orders';

const generateJsx = (
  orders: Orders_party_orders[] | null,
  context: PartialDeep<VegaWalletContextShape> = { keypair: { pub: '0x123' } }
) => {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
        <OrderListTable data={orders} cancel={jest.fn()} />
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
    expect(headers).toHaveLength(10);
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'Market',
      'Amount',
      'Type',
      'Status',
      'Filled',
      'Price',
      'Time In Force',
      'Created At',
      'Updated At',
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
      marketOrder.type || '',
      marketOrder.status,
      '5',
      '-',
      marketOrder.timeInForce,
      getDateTimeFormat().format(new Date(marketOrder.createdAt)),
      '-',
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
      limitOrder.type || '',
      limitOrder.status,
      '5',
      addDecimal(limitOrder.price, limitOrder.market?.decimalPlaces ?? 0),
      `${limitOrder.timeInForce}: ${getDateTimeFormat().format(
        new Date(limitOrder.expiresAt ?? '')
      )}`,
      getDateTimeFormat().format(new Date(limitOrder.createdAt)),
      '-',
      'Cancel',
    ];
    cells.forEach((cell, i) =>
      expect(cell).toHaveTextContent(expectedValues[i])
    );
  });

  it('should apply correct formatting for a rejected order', async () => {
    const rejectedOrder = {
      ...marketOrder,
      status: OrderStatus.Rejected,
      rejectionReason: OrderRejectionReason.InsufficientAssetBalance,
    };
    await act(async () => {
      render(generateJsx([rejectedOrder]));
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[3]).toHaveTextContent(
      `${rejectedOrder.status}: ${formatLabel(rejectedOrder.rejectionReason)}`
    );
  });
});
