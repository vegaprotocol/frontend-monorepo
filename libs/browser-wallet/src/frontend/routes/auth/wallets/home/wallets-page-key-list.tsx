import { AnchorButton } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

import { MessageIcon } from '@/components/icons/message';
import { KeyList } from '@/components/key-list';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useWalletStore } from '@/stores/wallets';
import type { Wallet } from '@/types/backend';

export const locators = {
  walletsCreateKey: 'wallets-create-key',
  walletsSignMessageButton: 'sign-message-button',
};

export interface WalletPageKeyListProperties {
  wallet: Wallet;
  onSignMessage: (key: string) => void;
}

export const WalletsPageKeyList = ({
  wallet,
  onSignMessage,
}: WalletPageKeyListProperties) => {
  const { request } = useJsonRpcClient();
  // Wallet loading is handled in auth, when the user is redirected to the auth page
  const { createNewKey } = useWalletStore((store) => ({
    createNewKey: store.createKey,
  }));
  const [creatingKey, setCreatingKey] = useState(false);
  const createKey = async () => {
    setCreatingKey(true);
    await createNewKey(request, wallet.name);
    setCreatingKey(false);
  };

  return (
    <>
      <KeyList
        keys={wallet.keys}
        renderActions={(k) => (
          <button
            data-testid={locators.walletsSignMessageButton}
            onClick={() => onSignMessage(k.publicKey)}
            className="cursor-pointer mt-2 ml-1"
          >
            <MessageIcon />
          </button>
        )}
      />
      <div className="mt-3 text-white">
        <AnchorButton
          disabled={creatingKey}
          onClick={createKey}
          data-testid={locators.walletsCreateKey}
        >
          Create new key/pair
        </AnchorButton>
      </div>
    </>
  );
};
