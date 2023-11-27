import { Splash } from '@vegaprotocol/ui-toolkit';
import { DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useT } from '../../lib/use-t';

export const DepositsContainer = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
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
