import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog, DepositsTable } from '@vegaprotocol/deposits';
import { useDeposits } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';

export const DepositsContainer = () => {
  const { deposits, loading, error } = useDeposits();
  const openDepositDialog = useDepositDialog((state) => state.open);

  return (
    <div className="h-full grid grid-rows-[1fr,min-content]">
      <div>
        <AsyncRenderer
          data={deposits}
          loading={loading}
          error={error}
          render={(data) => {
            return <DepositsTable deposits={data} />;
          }}
        />
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
