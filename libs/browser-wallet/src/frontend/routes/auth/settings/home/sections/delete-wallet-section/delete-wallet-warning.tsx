import { Button } from '@vegaprotocol/ui-toolkit';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Checkbox } from '@/components/checkbox';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useAsyncAction } from '@/hooks/async-action';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { FULL_ROUTES } from '@/routes/route-names';
import { useWalletStore } from '@/stores/wallets';

export const locators = {
  deleteWalletWarningContinueButton: 'delete-wallet-warning-continue-button',
  deleteWalletWarningCloseButton: 'delete-wallet-warning-close-button',
};

export interface DeleteWalletWarningProperties {
  onClose: () => void;
}

export const DeleteWalletWarning = ({
  onClose,
}: DeleteWalletWarningProperties) => {
  const { control } = useForm<{
    accept: boolean;
  }>();
  const accepted = useWatch({
    control,
    name: 'accept',
  });
  const { request } = useJsonRpcClient();
  const navigate = useNavigate();
  const { wallets } = useWalletStore((store) => ({
    wallets: store.wallets,
  }));
  const { handleSubmit } = useForm();

  const [wallet] = wallets;

  const deleteWallet = async () => {
    await request(RpcMethods.DeleteWallet, {
      name: wallet.name,
    });
    navigate(FULL_ROUTES.createWallet);
  };

  const { loading, loaderFunction } = useAsyncAction(deleteWallet);

  return (
    <div>
      <form onSubmit={handleSubmit(() => loaderFunction())}>
        <Checkbox
          name="accept"
          label="I have backed up my recovery phrase. I understand that I need the phrase to recover my wallet, and that if I delete it, my wallet may be lost."
          control={control}
        />
        <Button
          data-testid={locators.deleteWalletWarningContinueButton}
          disabled={!accepted || loading}
          variant="secondary"
          className="mt-4"
          fill={true}
          type="submit"
        >
          Continue
        </Button>
      </form>
      <Button
        data-testid={locators.deleteWalletWarningCloseButton}
        className="mt-2"
        fill={true}
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
};
