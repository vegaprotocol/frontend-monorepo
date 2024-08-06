import { fireEvent, render, screen } from '@testing-library/react';

import { locators, ViewRecoveryPhrase } from './view-recovery-phrase';

jest.mock('@/components/hidden-container', () => ({
  HiddenContainer: () => <div data-testid="hidden-container" />,
}));

describe('ViewRecoveryPhrase', () => {
  it('renders hidden information container and close button', () => {
    // 1138-EXRP-006 When I input the correct password I am presented with a hidden container with my recovery phrase in it
    render(<ViewRecoveryPhrase onClose={jest.fn()} recoveryPhrase="0x1" />);
    expect(screen.getByTestId('hidden-container')).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.exportRecoveryPhraseClose)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(locators.exportRecoveryPhraseClose)
    ).toHaveTextContent('Close');
  });
  it('calls on close when close is clicked', () => {
    const onClose = jest.fn();
    render(<ViewRecoveryPhrase onClose={onClose} recoveryPhrase="0x1" />);
    fireEvent.click(screen.getByTestId(locators.exportRecoveryPhraseClose));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
