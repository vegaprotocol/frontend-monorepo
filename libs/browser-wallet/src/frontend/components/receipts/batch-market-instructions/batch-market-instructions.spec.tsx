import { render, screen } from '@testing-library/react';

import { locators as subHeaderLocators } from '@/components/sub-header';

import { BatchMarketInstructions, locators } from './batch-market-instructions';
jest.mock('../orders/amend', () => ({
  AmendmentView: () => <div data-testid="amendment-view" />,
}));
jest.mock('../orders/cancellation', () => ({
  CancellationView: () => <div data-testid="cancellation-view" />,
}));
jest.mock('../orders/submission', () => ({
  SubmissionView: () => <div data-testid="submission-view" />,
}));
jest.mock('../orders/stop-submission', () => ({
  StopOrdersSubmissionView: () => (
    <div data-testid="stop-orders-submission-view" />
  ),
}));
jest.mock('../orders/stop-cancellation', () => ({
  StopOrderCancellationView: () => (
    <div data-testid="stop-order-cancellation-view" />
  ),
}));
jest.mock('../orders/cancellation/cancellation-view', () => ({
  CancellationView: () => <div data-testid="cancellation-view" />,
}));

describe('BatchMarketInstructions component', () => {
  const transaction = {
    batchMarketInstructions: {
      cancellations: [{}],
      amendments: [{}],
      submissions: [{}],
      stopOrdersSubmission: [{}],
      stopOrdersCancellation: [{}],
    },
  };

  it('renders all command sections', () => {
    render(<BatchMarketInstructions transaction={transaction} />);
    // 1114-BMKI-001 If there is at least one present I can see all submission details
    // 1114-BMKI-002 If there is at least one present I can see all amendment details
    // 1114-BMKI-003 If there is at least one present I can see all cancellation details
    // 1114-BMKI-004 If there is at least one present I can see all stop order submission details
    // 1114-BMKI-005 If there is at least one present I can see all stop order cancellation details
    const [
      cancellation,
      amendment,
      submission,
      stopOrderCancellation,
      stopOrderSubmission,
    ] = screen.getAllByTestId(subHeaderLocators.subHeader);

    expect(submission).toHaveTextContent('Submission');
    expect(cancellation).toHaveTextContent('Cancellation');
    expect(amendment).toHaveTextContent('Amendment');
    expect(stopOrderCancellation).toHaveTextContent('Stop Order Cancellation');
    expect(stopOrderSubmission).toHaveTextContent('Stop Order Submission');

    expect(screen.getByTestId('submission-view')).toBeInTheDocument();
    expect(screen.getByTestId('cancellation-view')).toBeInTheDocument();
    expect(screen.getByTestId('amendment-view')).toBeInTheDocument();
    expect(
      screen.getByTestId('stop-orders-submission-view')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('stop-order-cancellation-view')
    ).toBeInTheDocument();
  });

  it('renders titles for each transaction', () => {
    // 1114-BMKI-007 Renders a transaction title for each transaction type

    render(
      <BatchMarketInstructions
        transaction={{
          batchMarketInstructions: {
            cancellations: [
              {
                marketId: 'foo',
              },
              {
                orderId: 'bar',
              },
            ],
          },
        }}
      />
    );
    const [massOrderCancellation, orderCancellation] = screen.getAllByTestId(
      locators.header
    );

    expect(massOrderCancellation).toHaveTextContent(
      '1. Mass Order Cancellation'
    );
    expect(orderCancellation).toHaveTextContent('2. Order Cancellation');
  });

  it('renders sections with populated transactions', () => {
    const transaction = {
      batchMarketInstructions: {
        cancellations: [{}],
        amendments: [],
        submissions: [{}],
        stopOrdersSubmission: [],
        stopOrdersCancellation: [{}],
      },
    };
    render(<BatchMarketInstructions transaction={transaction} />);
    const [cancellation, submission, stopOrderSubmission] =
      screen.getAllByTestId(subHeaderLocators.subHeader);

    expect(submission).toHaveTextContent('Submission');
    expect(cancellation).toHaveTextContent('Cancellation');
    expect(stopOrderSubmission).toHaveTextContent('Stop Order Cancellations');

    expect(screen.getByTestId('cancellation-view')).toBeInTheDocument();
    expect(screen.getByTestId('submission-view')).toBeInTheDocument();
    expect(
      screen.getByTestId('stop-order-cancellation-view')
    ).toBeInTheDocument();
  });

  it('does not render command section if no items', () => {
    const transaction = {
      batchMarketInstructions: {},
    };
    render(<BatchMarketInstructions transaction={transaction} />);
    expect(
      screen.queryByTestId(subHeaderLocators.subHeader)
    ).not.toBeInTheDocument();
  });

  it('renders item for each submission', () => {
    const transactionWithSubmissions = {
      batchMarketInstructions: {
        cancellations: [],
        amendments: [],
        stopOrdersSubmission: [],
        stopOrdersCancellation: [],
        submissions: [
          { id: 1, name: 'Submission 1' },
          { id: 2, name: 'Submission 2' },
        ],
      },
    };
    render(
      <BatchMarketInstructions transaction={transactionWithSubmissions} />
    );

    expect(screen.getAllByTestId('header')).toHaveLength(2);
    expect(screen.getAllByTestId('header')[0]).toHaveTextContent('1.');
    expect(screen.getAllByTestId('header')[1]).toHaveTextContent('2.');
  });

  it('renders warning message if there are no transactions', () => {
    // 1114-BMKI-006 If there are no transactions present in any of the fields then I see a warning notification letting me know about this
    const transactionWithNoTransactions = {
      batchMarketInstructions: {
        cancellations: [],
        amendments: [],
        stopOrdersSubmission: [],
        stopOrdersCancellation: [],
        submissions: [],
      },
    };
    render(
      <BatchMarketInstructions transaction={transactionWithNoTransactions} />
    );
    expect(
      screen.getByTestId(locators.noTransactionsNotification)
    ).toHaveTextContent(
      'Batch market instructions did not contain any transactions. Please view the raw transaction and check this is the transaction you wish to send.'
    );
  });
});
