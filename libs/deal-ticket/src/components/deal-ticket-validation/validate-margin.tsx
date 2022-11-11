import { normalizeFormatNumber, t } from '@vegaprotocol/react-helpers';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { DepositDialog } from '@vegaprotocol/deposits';

interface Props {
  margin: string;
  symbol: string;
  id: string;
  balance: string;
  decimals: number;
}

export const ValidateMargin = ({
  margin,
  symbol,
  id,
  balance,
  decimals,
}: Props) => {
  const [depositDialog, setDepositDialog] = useState(false);
  return (
    <>
      <div
        className="flex flex-col center pb-3"
        data-testid="deal-ticket-margin-invalidated"
      >
        <p className="mb-2">
          {t("You don't have enough margin available to open this position.")}{' '}
          <ButtonLink
            data-testid="deal-ticket-deposit-dialog-button"
            onClick={() => setDepositDialog(true)}
          >
            {t(`Deposit ${symbol}`)}
          </ButtonLink>
        </p>
        <p>
          {`${normalizeFormatNumber(margin, decimals)} ${symbol} ${t(
            'currently required'
          )}, ${normalizeFormatNumber(balance, decimals)} ${symbol} ${t(
            'available'
          )}`}
        </p>
      </div>
      <DepositDialog
        depositDialog={depositDialog}
        setDepositDialog={setDepositDialog}
        assetId={id}
      />
    </>
  );
};
