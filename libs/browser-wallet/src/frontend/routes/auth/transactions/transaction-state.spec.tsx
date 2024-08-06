import { render, screen } from '@testing-library/react';

import { TransactionState } from '@/types/backend';

import { locators, VegaTransactionState } from './transactions-state';

const renderComponent = (state: TransactionState) => {
  render(<VegaTransactionState state={state} />);
};

describe('TransactionState', () => {
  it('renders info color when transaction state is confirmed', () => {
    renderComponent(TransactionState.Confirmed);
    expect(screen.getByTestId(locators.transactionState)).toHaveClass(
      'text-vega-blue-500'
    );
  });
  it('renders error color when transaction state is error', () => {
    renderComponent(TransactionState.Error);
    expect(screen.getByTestId(locators.transactionState)).toHaveClass(
      'text-vega-pink-500'
    );
  });
  it('renders neutral color when transaction state is rejected', () => {
    renderComponent(TransactionState.Rejected);
    expect(screen.getByTestId(locators.transactionState)).toHaveClass(
      'text-vega-dark-300'
    );
  });
});
