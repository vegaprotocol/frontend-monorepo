import React from 'react';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { Button, Dialog } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { DepositContainer } from '@vegaprotocol/deposits';

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
        <p>
          {t("You don't have enough margin available to open this position.")}
        </p>
        <p>
          {`${formatNumber(margin, decimals)} ${symbol} ${t(
            'currently required'
          )}, ${formatNumber(balance, decimals)} ${symbol} ${t('available')}`}
        </p>
        <Button
          className="center mt-2"
          variant="default"
          size="xs"
          data-testid="deal-ticket-deposit-dialog-button"
          onClick={() => setDepositDialog(true)}
        >
          {t('Deposit')} {symbol}
        </Button>
      </div>
      <Dialog open={depositDialog} onChange={setDepositDialog}>
        <h1 className="text-2xl mb-4">{t('Deposit')}</h1>
        <DepositContainer assetId={id} />
      </Dialog>
    </>
  );
};
