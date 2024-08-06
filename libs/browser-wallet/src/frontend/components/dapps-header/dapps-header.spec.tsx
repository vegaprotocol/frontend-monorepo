import { fireEvent, render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../config/well-known-networks';
import { DappsHeader, locators } from './dapps-header';

const renderComponent = () =>
  render(
    <MockNetworkProvider>
      <DappsHeader />
    </MockNetworkProvider>
  );

describe('WalletsHeader', () => {
  it('should render the wallets header and buttons', () => {
    // 1106-KEYS-010 There is a way to go to console from the wallet view
    // 1106-KEYS-011 There is a way to go govern from the wallet view
    // 1106-KEYS-012 There is a link to transfer which takes me to console transfer screen
    // 1106-KEYS-013 There is a way to withdraw which takes me to console withdraw screen
    // 1106-KEYS-014 There is a link to deposit which takes me to console deposit screen

    renderComponent();

    const walletsHeader = screen.getByTestId(locators.walletsHeader);
    const [
      tradeButton,
      governButton,
      transferButton,
      depositButton,
      withdrawButton,
    ] = screen.getAllByTestId(locators.walletsHeaderLink);

    expect(walletsHeader).toBeInTheDocument();

    expect(tradeButton).toHaveTextContent('Trade');
    expect(tradeButton).toHaveAttribute('href', fairground.console);
    expect(governButton).toHaveTextContent('Vote');
    expect(governButton).toHaveAttribute('href', fairground.governance);
    expect(transferButton).toHaveTextContent('Transfer');
    expect(transferButton).toHaveAttribute(
      'href',
      `${fairground.console}/#/portfolio/assets/transfer`
    );
    expect(depositButton).toHaveTextContent('Deposit');
    expect(depositButton).toHaveAttribute(
      'href',
      `${fairground.console}/#/portfolio/assets/deposit`
    );
    expect(withdrawButton).toHaveTextContent('Withdraw');
    expect(withdrawButton).toHaveAttribute(
      'href',
      `${fairground.console}/#/portfolio/assets/withdraw`
    );
  });

  it('renders the correct tooltip content', async () => {
    // 1106-KEYS-009 There is a way to see what's linked to my wallet from the wallet view
    renderComponent();

    const [
      tradeButton,
      governButton,
      transferButton,
      depositButton,
      withdrawButton,
    ] = screen.getAllByTestId(locators.walletsHeaderItem);
    fireEvent.pointerMove(tradeButton);
    await screen.findByRole('tooltip');
    expect(screen.queryByRole('tooltip')).toHaveTextContent('Console');
    fireEvent.pointerLeave(tradeButton);

    fireEvent.pointerMove(governButton);
    await screen.findByRole('tooltip');
    expect(screen.queryByRole('tooltip')).toHaveTextContent('Governance');
    fireEvent.pointerLeave(governButton);

    fireEvent.pointerMove(transferButton);
    await screen.findByRole('tooltip');
    expect(screen.queryByRole('tooltip')).toHaveTextContent('Transfer');
    fireEvent.pointerLeave(transferButton);

    fireEvent.pointerMove(depositButton);
    await screen.findByRole('tooltip');
    expect(screen.queryByRole('tooltip')).toHaveTextContent('Deposit');
    fireEvent.pointerLeave(depositButton);

    fireEvent.pointerMove(withdrawButton);
    await screen.findByRole('tooltip');
    expect(screen.queryByRole('tooltip')).toHaveTextContent('Withdraw');
  });
});
