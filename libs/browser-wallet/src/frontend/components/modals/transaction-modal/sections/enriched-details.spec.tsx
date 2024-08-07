import { render, screen } from '@testing-library/react';

import { EnrichedDetails } from './enriched-details';

jest.mock('../../../receipts', () => ({
  TransactionSwitch: () => {
    return <div data-testid="mocked-transaction-switch" />;
  },
}));

describe('EnrichedDetails', () => {
  it('renders null when TxSwitch is not present in map', () => {
    const { container } = render(
      <EnrichedDetails transaction={{ someUnknownTransaction: {} }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders TransactionSwitch when transaction is present in map', () => {
    const transaction = { transfer: { id: 1, amount: 100 } };
    render(<EnrichedDetails transaction={transaction} />);
    const transactionSwitchElement = screen.getByTestId(
      'mocked-transaction-switch'
    );

    expect(transactionSwitchElement).toBeInTheDocument();
  });
});
