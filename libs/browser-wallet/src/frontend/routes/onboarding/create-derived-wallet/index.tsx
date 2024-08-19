import { useDeriveMnemonic } from '@/hooks/suggest-mnemonic';

import { MnemonicPage } from '../components/mnemonic-page';
import { useAccount, useChainId } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { type ReactNode, useState } from 'react';
import { OnboardingPage } from '@/components/pages/onboarding-page';
import { FULL_ROUTES } from '@/routes/route-names';

export const locators = {
  saveMnemonicDescription: 'save-mnemonic-description',
};

export const CreateDerivedWalletPage = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <OnboardingPage
      name="Create derived wallet"
      backLocation={FULL_ROUTES.createWallet}
    >
      <>
        <p className="pb-6">
          You can use your Ethereum wallet to generate a new wallet. This wallet
          will be derived from your Ethereum wallet and can be used to interact
          with Vega.
        </p>
        <p className="pb-6">
          It has its' own mnemonic, however if this is lost you can use the same
          Ethereum wallet to regenerate the mnemonic.
        </p>
        <div>{children}</div>
      </>
    </OnboardingPage>
  );
};

export const CreateDerivedWalletContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return (
      <CreateDerivedWalletPage>
        <div className="text-center">
          <ConnectKitButton.Custom>
            {({ show }) => {
              return (
                <Button
                  variant="primary"
                  onClick={() => {
                    if (show) show();
                  }}
                >
                  Connect Ethereum Wallet
                </Button>
              );
            }}
          </ConnectKitButton.Custom>
        </div>
      </CreateDerivedWalletPage>
    );
  }
  return children;
};

export const CreateDerivedWalletForm = ({
  setMnemonic,
}: {
  setMnemonic: (mnemonic: string) => void;
}) => {
  const chainId = useChainId();
  const { derivedMnemonic, loading, error } = useDeriveMnemonic(chainId);
  const onClick = async () => {
    const result = await derivedMnemonic();
    setMnemonic(result);
  };
  return (
    <CreateDerivedWalletPage>
      <div className="text-center">
        <Button variant="primary" disabled={!!loading} onClick={onClick}>
          Create Derived Wallet
        </Button>
        {error && <InputError>{error}</InputError>}
      </div>
    </CreateDerivedWalletPage>
  );
};

export const CreateDerivedWallet = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  return (
    <CreateDerivedWalletContainer>
      {mnemonic ? (
        <MnemonicPage mnemonic={mnemonic} />
      ) : (
        <CreateDerivedWalletForm setMnemonic={setMnemonic} />
      )}
    </CreateDerivedWalletContainer>
  );
};
