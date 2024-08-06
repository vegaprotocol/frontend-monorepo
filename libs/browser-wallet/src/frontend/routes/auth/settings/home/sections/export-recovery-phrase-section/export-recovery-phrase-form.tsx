import { Button, Intent, Notification } from '@vegaprotocol/ui-toolkit';

import { PasswordForm } from '@/components/password-form';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

export const locators = {
  exportRecoveryPhraseForm: 'export-recovery-phrase-form',
  exportRecoveryPhraseFormDescription:
    'export-recovery-phrase-form-description',
  exportRecoveryPhraseFormModalClose: 'export-recovery-phrase-form-modal-close',
};

export interface ExportRecoveryPhraseFromProperties {
  walletName: string;
  onSuccess: (privateKey: string) => void;
  onClose: () => void;
}

export const ExportRecoveryPhraseForm = ({
  onSuccess,
  onClose,
  walletName,
}: ExportRecoveryPhraseFromProperties) => {
  const { request } = useJsonRpcClient();

  const exportPrivateKey = async (passphrase: string) => {
    const { recoveryPhrase } = await request(
      RpcMethods.ExportRecoveryPhrase,
      { passphrase, walletName },
      true
    );
    onSuccess(recoveryPhrase);
  };
  return (
    <>
      <Notification
        message="Warning: Never share this key. Anyone who has access to this key will have access to your assets."
        intent={Intent.Danger}
        data-testid={locators.exportRecoveryPhraseFormDescription}
      />
      <PasswordForm
        onSubmit={exportPrivateKey}
        text="Export"
        loadingText="Exporting..."
      />
      <Button
        data-testid={locators.exportRecoveryPhraseFormModalClose}
        fill={true}
        onClick={onClose}
        className="mt-2"
        variant="default"
      >
        Close
      </Button>
    </>
  );
};
