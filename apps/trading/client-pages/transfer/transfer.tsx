import { useSearchParams } from 'react-router-dom';
import { TransferContainer } from '@vegaprotocol/accounts';
import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';

export const Transfer = () => {
  const t = useT();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;

  const open = useDialogStore((store) => store.open);
  const { pubKey } = useVegaWallet();

  return (
    <div className="flex flex-col gap-4">
      <TransferContainer assetId={assetId} />
      {!pubKey && (
        <Notification
          intent={Intent.Info}
          message={t('Connet your wallet')}
          buttonProps={{
            text: t('Connect wallet'),
            action: open,
          }}
        />
      )}
    </div>
  );
};
