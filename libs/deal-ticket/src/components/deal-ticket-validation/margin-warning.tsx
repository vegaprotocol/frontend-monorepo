import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  Intent,
  VegaIcon,
  VegaIconNames,
  Tooltip,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';

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
  const description = (
    <div className="flex flex-col items-start gap-2 p-2">
      <p className="text-sm">
        {t('%s %s is currently required.', [
          addDecimalsFormatNumber(margin, asset.decimals),
          asset.symbol,
        ])}
      </p>
      <p className="text-sm">
        {t('You have only %s.', [
          addDecimalsFormatNumber(balance, asset.decimals),
        ])}
      </p>

      <TradingButton
        intent={Intent.Warning}
        size="small"
        onClick={() => onDeposit(asset.id)}
        data-testid="deal-ticket-deposit-dialog-button"
        type="button"
      >
        {t('Deposit %s', [asset.symbol])}
      </TradingButton>
    </div>
  );

  return (
    <Tooltip description={description}>
      <div
        className="flex text-xs items-center"
        data-testid="deal-ticket-warning-margin"
      >
        <span className="text-yellow-500 mr-2">
          <VegaIcon name={VegaIconNames.WARNING} />
        </span>
        {t('You may not have enough margin available to open this position.')}
      </div>
    </Tooltip>
  );
};
