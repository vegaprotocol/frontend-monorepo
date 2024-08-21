import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';

import { Header } from '@/components/header';
import { Wallet } from '@/components/icons/wallet';

import { FULL_ROUTES } from '../../route-names';

export const locators = {
  createNewWalletButton: 'create-new-wallet',
  importWalletButton: 'import-wallet',
  createDerivedWalletButton: 'create-derived-wallet',
};

export const CreateWallet = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center flex flex-col justify-center h-full px-5">
      <div className="mx-auto pb-4 text-white">
        <Wallet size={48} squareFill="black" />
      </div>
      <Header content="Create a wallet" />
      <Button
        autoFocus
        data-testid={locators.createDerivedWalletButton}
        onClick={() => {
          navigate(FULL_ROUTES.createDerivedWallet);
        }}
        className="mt-6 mb-4"
        intent={Intent.Primary}
      >
        Create a wallet from Ethereum wallet
      </Button>
      <Button
        autoFocus
        data-testid={locators.createNewWalletButton}
        onClick={() => {
          navigate(FULL_ROUTES.saveMnemonic);
        }}
        className="mt-6 mb-4"
      >
        Create a wallet
      </Button>
      <Button
        data-testid={locators.importWalletButton}
        onClick={() => {
          navigate(FULL_ROUTES.importWallet);
        }}
      >
        Import a Wallet
      </Button>
    </div>
  );
};
