import { useDeriveMnemonic } from '@/hooks/suggest-mnemonic';

import { MnemonicPage } from '../components/mnemonic-page';
import { useAccount, useChainId } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Button, InputError } from '@vegaprotocol/ui-toolkit';
import { type ReactNode, useState } from 'react';

export const locators = {
  saveMnemonicDescription: 'save-mnemonic-description',
};

export const CreateDerivedWalletContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ConnectKitButton.Custom>
          {({ show }) => {
            return (
              <Button
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
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <Button disabled={!!loading} onClick={onClick}>
          Create Derived Wallet
        </Button>
        {error && <InputError>{error}</InputError>}
      </div>
    </div>
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
