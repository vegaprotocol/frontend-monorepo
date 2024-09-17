import { ButtonLink, Dialog } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';

import { VegaSection } from '@/components/vega-section';
import { WALLET_NAME } from '@/lib/create-wallet';

import { ViewRecoveryPhrase } from './view-recovery-phrase';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

export const locators = {
  exportRecoveryPhraseTrigger: 'export-recovery-phrase-trigger',
  exportRecoveryPhraseTitle: 'export-recovery-phrase-title',
};

export const ExportRecoveryPhraseSection = () => {
  const [open, setOpen] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const { request } = useJsonRpcClient();
  useEffect(() => {
    const run = async () => {
      const { recoveryPhrase } = await request(
        RpcMethods.ExportRecoveryPhrase,
        { walletName: WALLET_NAME },
        true
      );
      setRecoveryPhrase(recoveryPhrase);
    };
    run();
  }, [request]);

  const resetDialog = () => {
    setRecoveryPhrase(null);
    setOpen(false);
  };

  return (
    <>
      <VegaSection>
        <ButtonLink
          onClick={() => setOpen(true)}
          data-testid={locators.exportRecoveryPhraseTrigger}
        >
          Export recovery phrase
        </ButtonLink>
      </VegaSection>
      <Dialog
        open={open}
        onInteractOutside={resetDialog}
        onChange={resetDialog}
      >
        <div className="p-2 text-base text-surface-0-fg-muted">
          <h1
            data-testid={locators.exportRecoveryPhraseTitle}
            className="text-xl  text-center text-surface-0-fg mb-2"
          >
            Export Recovery Phrase
          </h1>
          {recoveryPhrase && (
            <ViewRecoveryPhrase
              recoveryPhrase={recoveryPhrase}
              onClose={resetDialog}
            />
          )}
        </div>
      </Dialog>
    </>
  );
};
