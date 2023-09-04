import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';
import type { Order, OrderFieldsFragment, OrderListTableProps } from '../';
import { OrderListTable } from '../';
import {
  generateOrder,
  limitOrder,
  marketOrder,
} from '../mocks/generate-orders';

// Mock theme switcher to get around inconsistent mocking of zustand
// stores
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useThemeSwitcher: () => ({
    theme: 'light',
  }),
}));

const defaultProps: OrderListTableProps = {
  rowData: [],
  onEdit: jest.fn(),
  onCancel: jest.fn(),
  onView: jest.fn(),
  isReadOnly: false,
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
  it('should render correct columns', async () => {
    await act(async () => {
      render(generateJsx({ rowData: [marketOrder, limitOrder] }));
    });
    const expectedHeaders = [
      'Market',
      'Filled',
      'Size',
      'Type',
      'Status',
      'Price',
      'Time In Force',
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
      '0.05',
      '0.10',
      Schema.OrderTypeMapping[marketOrder.type as Schema.OrderType] || '',
      Schema.OrderStatusMapping[marketOrder.status],
      '-',
      Schema.OrderTimeInForceCode[marketOrder.timeInForce],
      getDateTimeFormat().format(new Date(marketOrder.createdAt)),
      '',
    ];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('should apply correct formatting applied for GTT limit order', async () => {
    await act(async () => {
      render(generateJsx({ rowData: [limitOrder] }));
    });
    const cells = screen.getAllByRole('gridcell');

    const expectedValues: string[] = [
      limitOrder.market?.tradableInstrument.instrument.code || '',
      '0.05',
      '0.10',
      Schema.OrderTypeMapping[limitOrder.type || Schema.OrderType.TYPE_LIMIT],
      Schema.OrderStatusMapping[limitOrder.status],
      '-',
      `${
        Schema.OrderTimeInForceCode[limitOrder.timeInForce]
      }: ${getDateTimeFormat().format(new Date(limitOrder.expiresAt ?? ''))}`,
      getDateTimeFormat().format(new Date(limitOrder.createdAt)),
      '',
    ];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('should apply correct formatting applied for an iceberg order', async () => {
    const icebergOrder = {
      ...limitOrder,
      size: '100',
      remaining: '50',
      icebergOrder: {
        __typename: 'IcebergOrder',
        minimumVisibleSize: '1',
        peakSize: '50',
        reservedRemaining: '50',
      } as OrderFieldsFragment['icebergOrder'],
    };
    await act(async () => {
      render(generateJsx({ rowData: [icebergOrder] }));
    });
    const cells = screen.getAllByRole('gridcell');
    const expectedValues: string[] = [
      icebergOrder.market?.tradableInstrument.instrument.code || '',
      '0.00',
      '+1.00',
      Schema.OrderTypeMapping[
        icebergOrder.type || Schema.OrderType.TYPE_LIMIT
      ] + ' (Iceberg)',
      Schema.OrderStatusMapping[icebergOrder.status],
      '-',
      `${
        Schema.OrderTimeInForceCode[icebergOrder.timeInForce]
      }: ${getDateTimeFormat().format(new Date(icebergOrder.expiresAt ?? ''))}`,
      getDateTimeFormat().format(new Date(icebergOrder.createdAt)),
    ];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('should apply correct formatting for a rejected order', async () => {
    const rejectedOrder = {
      ...marketOrder,
      status: Schema.OrderStatus.STATUS_REJECTED,
      rejectionReason:
        Schema.OrderRejectionReason.ORDER_ERROR_INSUFFICIENT_ASSET_BALANCE,
    };
    await act(async () => {
      render(generateJsx({ rowData: [rejectedOrder] }));
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells[4]).toHaveTextContent(
      `${Schema.OrderStatusMapping[rejectedOrder.status]}: ${
        Schema.OrderRejectionReasonMapping[rejectedOrder.rejectionReason]
      }`
    );
  });

  it('negative positionDecimalPoints should be properly rendered in size column', async () => {
    const localMarketOrder = {
      ...marketOrder,
      size: '3000',
      market: {
        ...marketOrder.market,
        positionDecimalPlaces: -4,
      },
    } as Order;

    await act(async () => {
      render(generateJsx({ rowData: [localMarketOrder] }));
    });

    const cells = screen.getAllByRole('gridcell');
    expect(cells[2]).toHaveTextContent('+30,000,000');
  });

  describe('amend cell', () => {
    it('allows cancelling and editing for permitted orders', async () => {
      const mockEdit = jest.fn();
      const mockCancel = jest.fn();
      const order = generateOrder({
        type: Schema.OrderType.TYPE_LIMIT,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        liquidityProvision: null,
        peggedOrder: null,
      });
      await act(async () => {
        render(
          generateJsx({
            rowData: [order],
            onEdit: mockEdit,
            onCancel: mockCancel,
          })
        );
      });
      const amendCell = getAmendCell();
      await userEvent.click(amendCell.getByTestId('edit'));
      expect(mockEdit).toHaveBeenCalledWith(order);
      await userEvent.click(amendCell.getByTestId('cancel'));
      expect(mockCancel).toHaveBeenCalledWith(order);
    });

    it('does not allow cancelling and editing for permitted orders if read only', async () => {
      const mockEdit = jest.fn();
      const mockCancel = jest.fn();
      const order = generateOrder({
        type: Schema.OrderType.TYPE_LIMIT,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        liquidityProvision: null,
        peggedOrder: null,
      });
      await act(async () => {
        render(
          generateJsx({
            rowData: [order],
            onEdit: mockEdit,
            onCancel: mockCancel,
            isReadOnly: true,
          })
        );
      });
      const amendCell = getAmendCell();
      expect(amendCell.queryByTestId('edit')).not.toBeInTheDocument();
      expect(amendCell.queryByTestId('cancel')).not.toBeInTheDocument();
    });

    it('shows if an order is a liquidity provision order and does not show order actions', async () => {
      const order = generateOrder({
        type: Schema.OrderType.TYPE_LIMIT,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        liquidityProvision: { __typename: 'LiquidityProvision' },
      });

      await act(async () => {
        render(generateJsx({ rowData: [order] }));
      });

      const amendCell = getAmendCell();
      const typeCell = screen.getAllByRole('gridcell')[3];
      expect(typeCell).toHaveTextContent('Liquidity provision');
      expect(amendCell.queryByTestId('edit')).not.toBeInTheDocument();
      expect(amendCell.queryByTestId('cancel')).not.toBeInTheDocument();
    });

    it('shows if an order is a pegged order and does not show order actions', async () => {
      const order = generateOrder({
        type: Schema.OrderType.TYPE_LIMIT,
        timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
        peggedOrder: {
          __typename: 'PeggedOrder',
          reference: Schema.PeggedReference.PEGGED_REFERENCE_MID,
          offset: '100',
        },
      });

      await act(async () => {
        render(generateJsx({ rowData: [order] }));
      });

      const amendCell = getAmendCell();
      const typeCell = screen.getAllByRole('gridcell')[3];
      expect(typeCell).toHaveTextContent('Mid - 10.0 Peg limit');
      expect(amendCell.queryByTestId('edit')).toBeInTheDocument();
      expect(amendCell.queryByTestId('cancel')).toBeInTheDocument();
    });

    it.each([
      Schema.OrderStatus.STATUS_ACTIVE,
      Schema.OrderStatus.STATUS_PARKED,
    ])('shows buttons for %s orders', async (status) => {
      const order = generateOrder({
        type: Schema.OrderType.TYPE_LIMIT,
        status,
      });

      await act(async () => {
        render(generateJsx({ rowData: [order] }));
      });

      const amendCell = getAmendCell();
      expect(amendCell.getAllByRole('button')).toHaveLength(3);
    });

    it.each([
      Schema.OrderStatus.STATUS_CANCELLED,
      Schema.OrderStatus.STATUS_EXPIRED,
      Schema.OrderStatus.STATUS_FILLED,
      Schema.OrderStatus.STATUS_REJECTED,
      Schema.OrderStatus.STATUS_STOPPED,
    ])(
      'does not show edit and cancel buttons for %s orders',
      async (status) => {
        const order = generateOrder({
          type: Schema.OrderType.TYPE_LIMIT,
          status,
        });

        await act(async () => {
          render(generateJsx({ rowData: [order] }));
        });

        const amendCell = getAmendCell();
        expect(amendCell.queryByTestId('edit')).not.toBeInTheDocument();
        expect(amendCell.queryByTestId('cancel')).not.toBeInTheDocument();
      }
    );

    const getAmendCell = () => {
      const cells = screen.getAllByRole('gridcell');
      return within(
        cells.find((c) => c.getAttribute('col-id') === 'amend') as HTMLElement
      );
    };
  });
});
