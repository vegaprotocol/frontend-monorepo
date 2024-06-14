import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import {
  Intent,
  VegaIcon,
  VegaIconNames,
  Tooltip,
  TradingButton,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../use-t';

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
  const t = useT();
  const description = (
    <div className="flex flex-col items-start gap-2 p-2">
      <p className="text-sm">
        {t('{{amount}} {{assetSymbol}} is currently required.', {
          amount: addDecimalsFormatNumber(margin, asset.decimals),
          assetSymbol: asset.symbol,
        })}
      </p>
      <p className="text-sm">
        {t('You have only {{amount}}.', {
          amount: addDecimalsFormatNumber(balance, asset.decimals),
        })}
      </p>

      <TradingButton
        intent={Intent.Warning}
        size="small"
        onClick={() => onDeposit(asset.id)}
        data-testid="deal-ticket-deposit-dialog-button"
        type="button"
      >
        {t('Deposit {{assetSymbol}}', { assetSymbol: asset.symbol })}
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
