import { render, screen } from '@testing-library/react';

import { ModalWrapper } from '.';

jest.mock('../connection-modal', () => ({
  ConnectionModal: () => <div data-testid="connection-modal" />,
}));

// jest.mock('../popover-open-splash', () => ({
//   PopoverOpenSplash: () => <div data-testid="popover-open-splash" />,
// }));

jest.mock('../transaction-modal', () => ({
  TransactionModal: () => <div data-testid="transaction-modal" />,
}));

jest.mock('../orientation-splash', () => ({
  OrientationSplash: () => <div data-testid="orientation-splash" />,
}));

describe('ModalWrapper', () => {
  it('renders all the modal components', () => {
    render(<ModalWrapper />);

    // expect(screen.getByTestId('popover-open-splash')).toBeInTheDocument();
    expect(screen.getByTestId('orientation-splash')).toBeInTheDocument();
    expect(screen.getByTestId('connection-modal')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-modal')).toBeInTheDocument();
  });
});
