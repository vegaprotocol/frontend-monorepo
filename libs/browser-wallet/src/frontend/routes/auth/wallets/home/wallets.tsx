import { useState } from 'react';

import { AsyncRenderer } from '@/components/async-renderer';
import { BasePage } from '@/components/pages/page';
import { SignMessageDialog } from '@/components/sign-message-dialog';
import { useWalletStore } from '@/stores/wallets';

import { WalletsPageKeyList } from './wallets-page-key-list';

export const locators = {
  walletsPage: 'wallets-page',
};

export const Wallets = () => {
  // Wallet loading is handled in auth, when the user is redirected to the auth page
  const { wallets } = useWalletStore((store) => ({
    wallets: store.wallets,
  }));

  const [selectedPubkey, setSelectedPubkey] = useState<string | null>(null);
  const [wallet] = wallets;

  return (
    <AsyncRenderer
      render={() => (
        <BasePage dataTestId={locators.walletsPage} title={wallet.name}>
          <WalletsPageKeyList
            onSignMessage={setSelectedPubkey}
            wallet={wallet}
          />
          <SignMessageDialog
            open={!!selectedPubkey}
            onClose={() => setSelectedPubkey(null)}
            publicKey={selectedPubkey}
          />
        </BasePage>
      )}
    />
  );
};
