import { useSearchParams } from 'react-router-dom';
import { WithdrawContainer } from '../../components/withdraw-container';

import { useDialogStore, useVegaWallet } from '@vegaprotocol/wallet-react';
import { ExternalLink, Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { Trans } from 'react-i18next';

export const Withdraw = () => {
  const t = useT();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('assetId') || undefined;

  const open = useDialogStore((store) => store.open);
  const { pubKey } = useVegaWallet();

  return (
    <div className="flex flex-col gap-4">
      <WithdrawContainer assetId={assetId} />
      {!pubKey && (
        <Notification
          intent={Intent.Info}
          message={
            <Trans
              defaults="Connect a <0>Vega wallet</0> to withdraw."
              components={[
                <ExternalLink href="https://vega.xyz/wallet" key="link">
                  Vega wallet
                </ExternalLink>,
              ]}
            />
          }
          buttonProps={{
            text: t('Connect wallet'),
            action: open,
          }}
        />
      )}
    </div>
  );
};
