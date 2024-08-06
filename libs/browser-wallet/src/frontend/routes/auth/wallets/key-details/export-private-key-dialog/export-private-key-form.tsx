import { Button, Intent, Notification } from '@vegaprotocol/ui-toolkit';

import { PasswordForm } from '@/components/password-form';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

export const locators = {
  privateKeyModalClose: 'private-key-modal-close',
  privateKeyDescription: 'private-key-description',
};

export interface ExportPrivateKeyFormProperties {
  publicKey: string;
  onSuccess: (privateKey: string) => void;
  onClose: () => void;
}

export const ExportPrivateKeyForm = ({
  publicKey,
  onSuccess,
  onClose,
}: ExportPrivateKeyFormProperties) => {
  const { request } = useJsonRpcClient();
  const exportPrivateKey = async (passphrase: string) => {
    const { secretKey } = await request(
      RpcMethods.ExportKey,
      { publicKey, passphrase },
      true
    );
    onSuccess(secretKey);
  };
  return (
    <>
      <Notification
        message="Warning: Never share this key. Anyone who has access to this key will have access to your assets."
        intent={Intent.Danger}
        data-testid={locators.privateKeyDescription}
      />
      <PasswordForm
        onSubmit={exportPrivateKey}
        text="Export"
        loadingText="Exporting..."
      />
      <Button
        data-testid={locators.privateKeyModalClose}
        fill={true}
        onClick={onClose}
        className="mt-2"
        variant="default"
        type="submit"
      >
        Close
      </Button>
    </>
  );
};
