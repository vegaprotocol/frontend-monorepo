import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import { DepositDialog } from '@vegaprotocol/deposits';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = () => {
  const [depositDialog, setDepositDialog] = useState(false);
  return (
    <div>
      <DepositDialog
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
      />
      <Button size="sm" onClick={() => setDepositDialog(true)}>
        {t('Make deposit')}
      </Button>
    </div>
  );
};
