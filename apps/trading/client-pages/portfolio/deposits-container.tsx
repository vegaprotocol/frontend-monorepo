import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog, DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const DepositsContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const openDepositDialog = useDepositDialog((state) => state.open);

  return (
    <div className="h-full grid grid-rows-[1fr,min-content]">
      <div className="h-full relative">
        <DepositsTable
          rowData={data || []}
          noRowsOverlayComponent={() => null}
        />
        <div className="pointer-events-none absolute inset-0">
          <AsyncRenderer
            data={data}
            loading={loading}
            error={error}
            noDataCondition={(data) => !(data && data.length)}
            noDataMessage={t('No deposits')}
            reload={reload}
          />
        </div>
      </div>
      {!isReadOnly && (
        <div className="h-auto flex justify-end px-[11px] py-2 bottom-0 right-1 absolute dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openDepositDialog()}
            data-testid="deposit-button"
          >
            {t('Deposit')}
          </Button>
        </div>
      )}
    </div>
  );
};
