import { MnemonicPage } from '../components/mnemonic-page';
import { useState } from 'react';
import { CreateDerivedWalletContainer } from './create-derived-wallet-container';
import { CreateDerivedWalletForm } from './create-derived-wallet-form';

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
