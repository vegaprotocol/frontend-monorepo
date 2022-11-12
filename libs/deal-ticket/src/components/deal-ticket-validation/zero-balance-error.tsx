import { t } from '@vegaprotocol/react-helpers';
import { ButtonLink, InputError } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { DepositDialog } from '@vegaprotocol/deposits';

interface ZeroBalanceErrorProps {
  asset: {
    id: string;
    symbol: string;
  };
}

export const ZeroBalanceError = ({ asset }: ZeroBalanceErrorProps) => {
  const [depositDialog, setDepositDialog] = useState(false);
  return (
    <>
      <InputError data-testid="deal-ticket-zero-balance">
        <p className="mb-2">
          {t('Insufficent balance. ')}
          <ButtonLink
            data-testid="deal-ticket-deposit-dialog-button"
            onClick={() => setDepositDialog(true)}
          >
            {t(`Deposit ${asset.symbol}`)}
          </ButtonLink>
        </p>
      </InputError>
      <DepositDialog
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
        assetId={asset.id}
      />
    </>
  );
};
