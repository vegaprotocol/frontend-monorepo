import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Notification, Intent } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog } from '@vegaprotocol/deposits';

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
    <Notification
      intent={Intent.Warning}
      testId="dealticket-warning-margin"
      message={`You may not have enough margin available to open this position. ${addDecimalsFormatNumber(
        margin,
        asset.decimals
      )} ${asset.symbol} ${t(
        'is currently required. You have only'
      )} ${addDecimalsFormatNumber(balance, asset.decimals)} ${
        asset.symbol
      } ${t('available.')}`}
      buttonProps={{
        text: t(`Deposit ${asset.symbol}`),
        action: () => openDepositDialog(asset.id),
        dataTestId: 'deal-ticket-deposit-dialog-button',
        size: 'sm',
      }}
    />
  );
};
