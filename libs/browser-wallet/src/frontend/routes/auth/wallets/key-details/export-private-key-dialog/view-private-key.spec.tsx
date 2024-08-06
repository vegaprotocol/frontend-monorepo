import { fireEvent, render, screen } from '@testing-library/react';

import { locators, ViewPrivateKey } from './view-private-key';

jest.mock('@/components/hidden-container', () => ({
  HiddenContainer: () => <div data-testid="hidden-container" />,
}));

describe('ViewPrivateKey', () => {
  it('renders hidden information container and close button', () => {
    // 1128-EXPT-005 - If I enter the correct passphrase then I see the reveal hidden information component and a button to close the modal
    render(<ViewPrivateKey onClose={jest.fn()} privateKey="0x1" />);
    expect(screen.getByTestId('hidden-container')).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.viewPrivateKeyClose)
    ).toBeInTheDocument();
    expect(screen.getByTestId(locators.viewPrivateKeyClose)).toHaveTextContent(
      'Close'
    );
  });
  it('calls on close when close is clicked', () => {
    const onClose = jest.fn();
    render(<ViewPrivateKey onClose={onClose} privateKey="0x1" />);
    fireEvent.click(screen.getByTestId(locators.viewPrivateKeyClose));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
