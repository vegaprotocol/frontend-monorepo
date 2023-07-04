import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { Notification, Intent } from '@vegaprotocol/ui-toolkit';

interface Props {
  margin: string;
  balance: string;
  asset: {
    id: string;
    symbol: string;
    decimals: number;
  };
  onDeposit: (assetId: string) => void;
}

export const MarginWarning = ({ margin, balance, asset, onDeposit }: Props) => {
  return (
    <Notification
      intent={Intent.Warning}
      testId="deal-ticket-warning-margin"
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
        action: () => onDeposit(asset.id),
        dataTestId: 'deal-ticket-deposit-dialog-button',
        size: 'sm',
      }}
    />
  );
};
