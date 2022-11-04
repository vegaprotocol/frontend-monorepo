import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { DepositDialog, DepositsTable } from '@vegaprotocol/deposits';
import { useDeposits } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/react-helpers';
import { useState } from 'react';

export const DepositsContainer = () => {
  const { deposits, loading, error } = useDeposits();
  const [depositDialog, setDepositDialog] = useState(false);

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
      <DepositDialog
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
      />
      <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
        <Button size="sm" onClick={() => setDepositDialog(true)}>
          {t('Deposit')}
        </Button>
      </div>
    </div>
  );
};
