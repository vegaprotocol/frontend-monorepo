import { t } from '@vegaprotocol/react-helpers';
import { Button } from '@vegaprotocol/ui-toolkit';
import { DepositDialog, useDepositDialog } from '@vegaprotocol/deposits';

/**
 *  Fetches data required for the Deposit page
 */
export const DepositContainer = () => {
  const openDepositDialog = useDepositDialog((state) => state.open);
  return (
    <div>
      <DepositDialog />
      <Button size="sm" onClick={() => openDepositDialog()}>
        {t('Make deposit')}
      </Button>
    </div>
  );
};
