import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { addDecimal, getDateTimeFormat } from '@vegaprotocol/react-helpers';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
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

import type { OrderListTableProps } from '../';
import { OrderListTable } from '../';
import {
  generateOrder,
  limitOrder,
  marketOrder,
} from '../mocks/generate-orders';

const defaultProps: OrderListTableProps = {
  rowData: [],
  setEditOrder: jest.fn(),
  cancel: jest.fn(),
};

const generateJsx = (
  props: Partial<OrderListTableProps> = defaultProps,
  context: PartialDeep<VegaWalletContextShape> = { pubKey: '0x123' }
) => {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
        <OrderListTable {...defaultProps} {...props} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

describe('OrderListTable', () => {
  it('should show no orders message', async () => {
    await act(async () => {
      render(generateJsx({ rowData: [] }));
    });
    expect(screen.getByText('No orders')).toBeInTheDocument();
  });

  it('should render correct columns', async () => {
    await act(async () => {
      render(generateJsx({ rowData: [marketOrder, limitOrder] }));
    });
    const expectedHeaders = [
      'Market',
      'Size',
      'Type',
      'Status',
      'Filled',
      'Price',
      'Time In Force',
      'Created At',
      'Updated At',
      '', // no cell header for edit/cancel
    ];
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('should apply correct formatting for market order', async () => {
    await act(async () => {
      render(generateJsx({ rowData: [marketOrder] }));
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
    ];
    cells.forEach((cell, i) =>
      expect(cell).toHaveTextContent(expectedValues[i])
    );
  });

  it('should apply correct formatting applied for GTT limit order', async () => {
    await act(async () => {
      render(generateJsx({ rowData: [limitOrder] }));
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
      render(generateJsx({ rowData: [rejectedOrder] }));
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[3]).toHaveTextContent(
      `${OrderStatusMapping[rejectedOrder.status]}: ${
        OrderRejectionReasonMapping[rejectedOrder.rejectionReason]
      }`
    );
  });

  describe('amend cell', () => {
    it('allows cancelling and editing for permitted orders', async () => {
      const mockEdit = jest.fn();
      const mockCancel = jest.fn();
      const order = generateOrder({
        type: OrderType.TYPE_LIMIT,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
        liquidityProvision: null,
        peggedOrder: null,
      });
      await act(async () => {
        render(
          generateJsx({
            rowData: [order],
            setEditOrder: mockEdit,
            cancel: mockCancel,
          })
        );
      });
      const amendCell = getAmendCell();
      expect(amendCell.getAllByRole('button')).toHaveLength(2);
      await userEvent.click(amendCell.getByTestId('edit'));
      expect(mockEdit).toHaveBeenCalledWith(order);
      await userEvent.click(amendCell.getByTestId('cancel'));
      expect(mockCancel).toHaveBeenCalledWith(order);
    });

    it('shows if an order is a liquidity provision order and does not show order actions', async () => {
      const order = generateOrder({
        type: OrderType.TYPE_LIMIT,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
        liquidityProvision: { __typename: 'LiquidityProvision' },
      });

      await act(async () => {
        render(generateJsx({ rowData: [order] }));
      });

      const amendCell = getAmendCell();
      const typeCell = screen.getAllByRole('gridcell')[2];
      expect(typeCell).toHaveTextContent('Liquidity provision');
      expect(amendCell.queryAllByRole('button')).toHaveLength(0);
    });

    it('shows if an order is a pegged order and does not show order actions', async () => {
      const order = generateOrder({
        type: OrderType.TYPE_LIMIT,
        timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
        peggedOrder: {
          __typename: 'PeggedOrder',
        },
      });

      await act(async () => {
        render(generateJsx({ rowData: [order] }));
      });

      const amendCell = getAmendCell();
      const typeCell = screen.getAllByRole('gridcell')[2];
      expect(typeCell).toHaveTextContent('Pegged');
      expect(amendCell.queryAllByRole('button')).toHaveLength(0);
    });

    it.each([OrderStatus.STATUS_ACTIVE, OrderStatus.STATUS_PARKED])(
      'shows buttons for %s orders',
      async (status) => {
        const order = generateOrder({
          type: OrderType.TYPE_LIMIT,
          status,
        });

        await act(async () => {
          render(generateJsx({ rowData: [order] }));
        });

        const amendCell = getAmendCell();
        expect(amendCell.getAllByRole('button')).toHaveLength(2);
      }
    );

    it.each([
      OrderStatus.STATUS_CANCELLED,
      OrderStatus.STATUS_EXPIRED,
      OrderStatus.STATUS_FILLED,
      OrderStatus.STATUS_REJECTED,
      OrderStatus.STATUS_STOPPED,
    ])('does not show buttons for %s orders', async (status) => {
      const order = generateOrder({
        type: OrderType.TYPE_LIMIT,
        status,
      });

      await act(async () => {
        render(generateJsx({ rowData: [order] }));
      });

      const amendCell = getAmendCell();
      expect(amendCell.queryAllByRole('button')).toHaveLength(0);
    });

    const getAmendCell = () => {
      const cells = screen.getAllByRole('gridcell');
      return within(
        cells.find((c) => c.getAttribute('col-id') === 'amend') as HTMLElement
      );
    };
  });
});
