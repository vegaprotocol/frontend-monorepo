import { formatNumber, t } from '@vegaprotocol/utils';
import { Notification, Intent } from '@vegaprotocol/ui-toolkit';
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
      <Notification
        intent={Intent.Warning}
        testId="dealticket-warning-margin"
        message={`You may not have enough margin available to open this position. ${formatNumber(
          margin,
          asset.decimals
        )} ${asset.symbol} ${t(
          'is currently required. You have only'
        )} ${formatNumber(balance, asset.decimals)} ${asset.symbol} ${t(
          'available.'
        )}`}
        buttonProps={{
          text: t(`Deposit ${asset.symbol}`),
          action: () => openDepositDialog(asset.id),
          dataTestId: 'deal-ticket-deposit-dialog-button',
        }}
      />
      <DepositDialog />
    </>
  );
};
