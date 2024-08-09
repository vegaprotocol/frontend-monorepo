import { ButtonLink, Dialog } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';

import { VegaSection } from '@/components/vega-section';

import { ExportPrivateKeyForm } from './export-private-key-form';
import { ViewPrivateKey } from './view-private-key';

export const locators = {
  privateKeyDialog: 'private-key-dialog',
  privateKeyTitle: 'private-key-title',
  privateKeyTrigger: 'private-key-trigger',
};

export const ExportPrivateKeysDialog = ({
  publicKey,
}: {
  publicKey: string;
}) => {
  const [open, setOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  const resetDialog = () => {
    setPrivateKey(null);
    setOpen(false);
  };
  return (
    <>
      <VegaSection>
        <ButtonLink
          onClick={() => setOpen(true)}
          data-testid={locators.privateKeyTrigger}
        >
          Export private key
        </ButtonLink>
      </VegaSection>
      <Dialog
        open={open}
        onInteractOutside={resetDialog}
        onChange={resetDialog}
      >
        <div className="p-2 text-base text-vega-dark-400">
          <h1
            data-testid={locators.privateKeyTitle}
            className="text-xl  text-center text-white mb-2"
          >
            Export Private Key
          </h1>
          {privateKey ? (
            <ViewPrivateKey privateKey={privateKey} onClose={resetDialog} />
          ) : (
            <ExportPrivateKeyForm
              publicKey={publicKey}
              onSuccess={(passphrase: string) => setPrivateKey(passphrase)}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      </Dialog>
    </>
  );
};
