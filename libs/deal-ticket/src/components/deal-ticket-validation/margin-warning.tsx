import { normalizeFormatNumber, t } from '@vegaprotocol/react-helpers';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { DepositDialog } from '@vegaprotocol/deposits';

interface Props {
  margin: string;
  balance: string;
  asset: {
    id: string;
    symbol: string;
    decimals: number;
  };
}

export const MarginWarning = ({ margin, balance, asset }: Props) => {
  const [depositDialog, setDepositDialog] = useState(false);
  return (
    <>
      <div
        className="text-sm text-vega-orange mb-4"
        data-testid="deal-ticket-margin-invalidated"
      >
        <p className="mb-2">
          {t('You may not have enough margin available to open this position.')}{' '}
          <ButtonLink
            data-testid="deal-ticket-deposit-dialog-button"
            onClick={() => setDepositDialog(true)}
          >
            {t(`Deposit ${asset.symbol}`)}
          </ButtonLink>
        </p>
        <p>
          {`${normalizeFormatNumber(margin, asset.decimals)} ${
            asset.symbol
          } ${t('currently required')}, ${normalizeFormatNumber(
            balance,
            asset.decimals
          )} ${asset.symbol} ${t('available')}`}
        </p>
      </div>
      <DepositDialog
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
        assetId={asset.id}
      />
    </>
  );
};
