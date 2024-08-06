import { ButtonLink, Dialog } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

import { VegaSection } from '@/components/vega-section';

import { DeleteWalletWarning } from './delete-wallet-warning';

export const locators = {
  deleteWalletTrigger: 'delete-wallet-trigger',
  deleteWalletName: 'delete-wallet-name',
  deleteWalletTitle: 'delete-wallet-title',
};

export interface FormFields {
  walletName: string;
}

export const DeleteWallet = () => {
  const [open, setOpen] = useState(false);

  const resetDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <VegaSection>
        <ButtonLink
          onClick={() => setOpen(true)}
          data-testid={locators.deleteWalletTrigger}
        >
          Delete wallet
        </ButtonLink>
      </VegaSection>
      <Dialog
        open={open}
        onInteractOutside={resetDialog}
        onChange={resetDialog}
      >
        <div className="p-2 text-base text-vega-dark-400">
          <h1
            data-testid={locators.deleteWalletTitle}
            className="text-xl  text-center text-white mb-2"
          >
            Delete Wallet
          </h1>
          <DeleteWalletWarning onClose={resetDialog} />
        </div>
      </Dialog>
    </>
  );
};
