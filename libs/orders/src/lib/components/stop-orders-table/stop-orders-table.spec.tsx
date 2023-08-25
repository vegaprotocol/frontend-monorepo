import { act, render, screen } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {
  StopOrdersTable,
  type StopOrdersTableProps,
} from './stop-orders-table';
import { generateStopOrder } from '../mocks/generate-stop-orders';

// Mock theme switcher to get around inconsistent mocking of zustand
// stores
jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useThemeSwitcher: () => ({
    theme: 'light',
  }),
}));

jest.mock('@vegaprotocol/utils', () => ({
  ...jest.requireActual('@vegaprotocol/utils'),
  getDateTimeFormat: jest.fn(() => ({
    format: (date: Date) => date.toISOString(),
  })),
}));

const defaultProps: StopOrdersTableProps = {
  onView: jest.fn(),
  rowData: [],
  onCancel: jest.fn(),
  isReadOnly: false,
};

const generateJsx = (
  props: Partial<StopOrdersTableProps> = defaultProps,
  context: PartialDeep<VegaWalletContextShape> = { pubKey: '0x123' }
) => {
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={context as VegaWalletContextShape}>
        <StopOrdersTable {...defaultProps} {...props} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

const rowData = [
  generateStopOrder({
    id: 'stop-order-1',
    trigger: { price: '80', __typename: 'StopOrderPrice' },
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
    expiresAt: '2023-08-26T08:31:22Z',
    expiryStrategy: Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_SUBMIT,
    submission: {
      size: '100',
      side: Schema.Side.SIDE_BUY,
      type: Schema.OrderType.TYPE_LIMIT,
      price: '120',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_FOK,
    },
    status: Schema.StopOrderStatus.STATUS_CANCELLED,
  }),
  generateStopOrder({
    id: 'stop-order-2',
    trigger: { price: '90', __typename: 'StopOrderPrice' },
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    expiresAt: '2023-08-26T08:31:22Z',
    expiryStrategy: Schema.StopOrderExpiryStrategy.EXPIRY_STRATEGY_CANCELS,
    submission: {
      size: '110',
      side: Schema.Side.SIDE_SELL,
      type: Schema.OrderType.TYPE_MARKET,
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
    },
    status: Schema.StopOrderStatus.STATUS_EXPIRED,
  }),
  generateStopOrder({
    id: 'stop-order-3',
    trigger: {
      trailingPercentOffset: '0.1',
      __typename: 'StopOrderTrailingPercentOffset',
    },
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_FALLS_BELOW,
    status: Schema.StopOrderStatus.STATUS_PENDING,
  }),
  generateStopOrder({
    id: 'stop-order-4',
    trigger: {
      trailingPercentOffset: '0.2',
      __typename: 'StopOrderTrailingPercentOffset',
    },
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    status: Schema.StopOrderStatus.STATUS_REJECTED,
  }),
  generateStopOrder({
    id: 'stop-order-5',
    status: Schema.StopOrderStatus.STATUS_STOPPED,
  }),
  generateStopOrder({
    id: 'stop-order-6',
    status: Schema.StopOrderStatus.STATUS_TRIGGERED,
    order: { id: 'order-id' },
  }),
];

describe('StopOrdersTable', () => {
  it('should render correct columns', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const expectedHeaders = [
      'Market',
      'Trigger',
      'Expires At',
      'Size',
      'Submission Type',
      'Status',
      'Submission Price',
      'Submission Time In Force',
      'Updated At',
      '', // no cell header for edit/cancel
    ];
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('formats trigger column', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const grid = screen.getByRole('treegrid');
    const cells = grid.querySelectorAll('.ag-body [col-id="trigger"]');

    const expectedValues: string[] = [
      'Mark < 8.0',
      'Mark > 9.0',
      'Mark +10.0%',
      'Mark -20.0%',
    ];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('formats expires at column', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const grid = screen.getByRole('treegrid');
    const cells = grid.querySelectorAll('.ag-body [col-id="expiresAt"]');

    const expectedValues: string[] = [
      'Submit 2023-08-26T08:31:22.000Z',
      'Cancels 2023-08-26T08:31:22.000Z',
    ];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('formats size column', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const grid = screen.getByRole('treegrid');
    const cells = grid.querySelectorAll('.ag-body [col-id="submission.size"]');

    const expectedValues: string[] = ['+1.00', '-1.10'];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('formats type column', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const grid = screen.getByRole('treegrid');
    const cells = grid.querySelectorAll('.ag-body [col-id="submission.type"]');

    const expectedValues: string[] = ['Limit', 'Market'];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });
  it('formats status column', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const grid = screen.getByRole('treegrid');
    const cells = grid.querySelectorAll('.ag-body [col-id="status"]');

    const expectedValues: string[] = [
      'Cancelled',
      'Expired',
      'Pending',
      'Rejected',
      'Stopped',
      'Triggered',
    ];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('formats price column', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const grid = screen.getByRole('treegrid');
    const cells = grid.querySelectorAll('.ag-body [col-id="submission.price"]');

    const expectedValues: string[] = ['12.0', '-'];
    expectedValues.forEach((expectedValue, i) =>
      expect(cells[i]).toHaveTextContent(expectedValue)
    );
  });

  it('shows cancel button only for pending stop orders', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const cancelButtons = screen.getAllByTestId('cancel');
    expect(cancelButtons).toHaveLength(1);
    cancelButtons.forEach((cancelButton) => {
      const id = cancelButton.closest('[role="row"]')?.getAttribute('row-id');
      expect(rowData.find((row) => row.id === id)?.status).toEqual(
        Schema.StopOrderStatus.STATUS_PENDING
      );
    });
  });

  it('shows actions dropdown only for triggered stop orders', async () => {
    await act(async () => {
      render(generateJsx({ rowData }));
    });
    const dropdownMenuButtons = screen.getAllByTestId('dropdown-menu');
    expect(dropdownMenuButtons).toHaveLength(1);
    dropdownMenuButtons.forEach((dropdownMenuButton) => {
      const id = dropdownMenuButton
        .closest('[role="row"]')
        ?.getAttribute('row-id');
      expect(rowData.find((row) => row.id === id)?.status).toEqual(
        Schema.StopOrderStatus.STATUS_TRIGGERED
      );
    });
  });

  it('action dropdown has copy and view order actions', async () => {
    const onView = jest.fn();
    const user = userEvent.setup();
    await act(async () => {
      render(generateJsx({ rowData, onView }));
    });
    const dropdownMenuButtons = screen.getByTestId('dropdown-menu');
    dropdownMenuButtons.click();
    await user.click(dropdownMenuButtons as HTMLButtonElement);
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent('Copy order ID');
    expect(menuItems[1]).toHaveTextContent('View order details');
    menuItems[1].click();
    expect(onView).toBeCalled();
  });
});
