import { Splash } from '@vegaprotocol/ui-toolkit';
import { DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const DepositsContainer = () => {
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
