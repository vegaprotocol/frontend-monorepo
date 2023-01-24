import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog, DepositsTable } from '@vegaprotocol/deposits';
import { useDeposits } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';

export const DepositsContainer = () => {
  const { deposits, loading, error } = useDeposits();
  const openDepositDialog = useDepositDialog((state) => state.open);

  return (
    <div className="h-full grid grid-rows-[1fr,min-content]">
      <div className="h-full relative">
        <DepositsTable
          rowData={deposits || []}
          noRowsOverlayComponent={() => null}
        />
        <div className="pointer-events-none absolute inset-0">
          <AsyncRenderer
            data={deposits}
            loading={loading}
            error={error}
            noDataCondition={(data) => !(data && data.length)}
            noDataMessage={t('No deposits')}
          />
        </div>
      </div>
      <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
        <Button
          size="sm"
          onClick={() => openDepositDialog()}
          data-testid="deposit-button"
        >
          {t('Deposit')}
        </Button>
      </div>
    </div>
  );
};
