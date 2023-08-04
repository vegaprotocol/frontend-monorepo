import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import { DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useSidebar, ViewType } from '../../components/sidebar';

export const DepositsContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const setView = useSidebar((store) => store.setView);
  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }
  return (
    <div className="h-full">
      <DepositsTable
        rowData={data}
        overlayNoRowsTemplate={error ? error.message : t('No deposits')}
      />
      {!isReadOnly && (
        <div className="h-auto flex justify-end p-2 bottom-0 right-0 absolute dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setView({ type: ViewType.Deposit })}
            data-testid="deposit-button"
          >
            {t('Deposit')}
          </Button>
        </div>
      )}
    </div>
  );
};
