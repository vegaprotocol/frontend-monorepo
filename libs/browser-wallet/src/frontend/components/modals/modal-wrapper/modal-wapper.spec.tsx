import { render, screen } from '@testing-library/react';

import { ModalWrapper } from '.';

jest.mock('../connection-modal', () => ({
  ConnectionModal: () => <div data-testid="connection-modal" />,
}));

jest.mock('../transaction-modal', () => ({
  TransactionModal: () => <div data-testid="transaction-modal" />,
}));

describe('ModalWrapper', () => {
  it('renders all the modal components', () => {
    render(<ModalWrapper />);

    expect(screen.getByTestId('connection-modal')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-modal')).toBeInTheDocument();
  });
});
