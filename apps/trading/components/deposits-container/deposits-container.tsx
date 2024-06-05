import { DepositsTable } from '@vegaprotocol/deposits';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import { useDeposits } from '../../lib/hooks/use-deposits';

export const DepositsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data, error } = useDeposits({ partyId: pubKey });

  return (
    <DepositsTable
      rowData={data}
      overlayNoRowsTemplate={error ? error.message : t('No deposits')}
    />
  );
};
