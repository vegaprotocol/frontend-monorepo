import { Splash } from '@vegaprotocol/ui-toolkit';
import { DepositsTable, useDeposits } from '@vegaprotocol/deposits';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';

export const DepositsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data, error } = useDeposits({ pubKey });
  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }
  return (
    <DepositsTable
      rowData={data}
      overlayNoRowsTemplate={error ? error.message : t('No deposits')}
    />
  );
};
