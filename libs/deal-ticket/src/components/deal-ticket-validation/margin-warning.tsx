import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { DepositDialog, useDepositDialog } from '@vegaprotocol/deposits';

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
  const openDepositDialog = useDepositDialog((state) => state.open);
  return (
    <>
      <div
        className="text-xs text-warning mb-4"
        data-testid="dealticket-warning-margin"
      >
        <p className="mb-2">
          {t('You may not have enough margin available to open this position.')}{' '}
          <ButtonLink
            data-testid="deal-ticket-deposit-dialog-button"
            onClick={() => openDepositDialog(asset.id)}
          >
            {t(`Deposit ${asset.symbol}`)}
          </ButtonLink>
        </p>
        <p>
          {`${formatNumber(margin, asset.decimals)} ${asset.symbol} ${t(
            'currently required'
          )}, ${formatNumber(balance, asset.decimals)} ${asset.symbol} ${t(
            'available'
          )}`}
        </p>
      </div>
      <DepositDialog />
    </>
  );
};
