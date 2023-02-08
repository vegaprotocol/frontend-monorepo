import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog, DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const DepositsContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, loading, error } = useDataProvider({
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
          />
        </div>
      </div>
      {!isReadOnly && (
        <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
          <Button
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
