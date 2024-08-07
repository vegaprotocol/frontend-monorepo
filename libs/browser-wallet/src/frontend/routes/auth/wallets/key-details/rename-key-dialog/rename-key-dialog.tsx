import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

import { VegaKey } from '@/components/keys/vega-key';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useWalletStore } from '@/stores/wallets';
import type { Key } from '@/types/backend';

import { CONSTANTS } from '../../../../../lib/constants';
import { RenameKeyForm } from './rename-key-form';

export const locators = {
  renameKeyTrigger: 'rename-key-trigger',
  renameKeyTitle: 'rename-key-title',
};

export interface FormFields {
  keyName: string;
}

interface RenameKeyDialogProperties {
  vegaKey: Key;
}

export const RenameKeyDialog = ({ vegaKey }: RenameKeyDialogProperties) => {
  const [open, setOpen] = useState(false);
  const { reloadWallets } = useWalletStore((state) => ({
    reloadWallets: state.reloadWallets,
  }));
  const { request } = useJsonRpcClient();
  const resetDialog = () => {
    setOpen(false);
  };
  const onComplete = async () => {
    await reloadWallets(request);
    resetDialog();
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ml-2 flex flex-col justify-center text-vega-dark-400"
        data-testid={locators.renameKeyTrigger}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.31 10.44L1.5 14.5L5.56 13.69L14.5 4.75001L11.25 1.50001V1.51001L9.97784 2.78075L9.97356 2.77647L9.26645 3.48357L9.27033 3.48746L2.31 10.44ZM11.25 2.92001L13.08 4.75001L12.5135 5.31646L10.6835 3.48646L11.25 2.92001ZM9.97644 4.19357L11.8064 6.02357L6.02355 11.8065L4.19355 9.97646L9.97644 4.19357ZM5.31644 12.5136L5.07 12.76L2.78 13.22L3.24 10.93L3.48644 10.6836L5.31644 12.5136Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dialog
        open={open}
        onInteractOutside={resetDialog}
        onChange={resetDialog}
      >
        <div
          className="p-2 text-base text-vega-dark-400 overflow-hidden"
          style={{ maxWidth: CONSTANTS.width - 60 }}
        >
          <h1
            data-testid={locators.renameKeyTitle}
            className="text-xl text-center text-white mb-2"
          >
            Rename Key
          </h1>
          <VegaKey name={vegaKey.name} publicKey={vegaKey.publicKey} />
          <RenameKeyForm
            onComplete={onComplete}
            publicKey={vegaKey.publicKey}
            keyName={vegaKey.name}
          />
        </div>
      </Dialog>
    </>
  );
};
