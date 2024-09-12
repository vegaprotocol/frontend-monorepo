import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import componentLocators from '@/components/locators';

import { FULL_ROUTES } from '../../route-names';
import { CreateWallet, locators } from '.';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <CreateWallet />
    </MemoryRouter>
  );

describe('Create wallet', () => {
  it('renders icon and buttons', () => {
    renderComponent();
    expect(
      screen.getByTestId(componentLocators.walletIcon)
    ).toBeInTheDocument();
    // expect(
    //   screen.getByTestId(locators.createNewWalletButton)
    // ).toHaveTextContent('Create a wallet');
    // expect(screen.getByTestId(locators.createNewWalletButton)).toHaveFocus();
    expect(screen.getByTestId(locators.importWalletButton)).toHaveTextContent(
      'Import a Wallet'
    );
  });

  it('navigates to import wallet page when import button is pressed', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.importWalletButton));
    expect(mockNavigate).toHaveBeenCalledWith(FULL_ROUTES.importWallet);
  });

  // it('navigates to save mnemonic route when create wallet button is pressed', async () => {
  //   renderComponent();
  //   fireEvent.click(screen.getByTestId(locators.createNewWalletButton));
  //   expect(mockNavigate).toHaveBeenCalledWith(FULL_ROUTES.saveMnemonic);
  // });
});
