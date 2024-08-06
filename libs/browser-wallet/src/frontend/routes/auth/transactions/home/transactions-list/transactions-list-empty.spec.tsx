import { render, screen } from '@testing-library/react';

import { locators, TransactionListEmpty } from './transactions-list-empty';

describe('TransactionsListEmpty', () => {
  it('should render correctly', () => {
    render(<TransactionListEmpty />);

    expect(screen.getByTestId(locators.transactionListEmpty)).toHaveTextContent(
      'No transactions have been placed using this wallet on this network.'
    );
  });
});
