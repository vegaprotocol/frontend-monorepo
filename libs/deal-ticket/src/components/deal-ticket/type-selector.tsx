import { FormGroup, InputError, Tooltip } from '@vegaprotocol/ui-toolkit';
import { DataGrid, t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';

interface TypeSelectorProps {
  value: Schema.OrderType;
  onSelect: (type: Schema.OrderType) => void;
  market: MarketDealTicket;
  errorMessage?: string;
}

const toggles = [
  { label: t('Market'), value: Schema.OrderType.TYPE_MARKET },
  { label: t('Limit'), value: Schema.OrderType.TYPE_LIMIT },
];

export const TypeSelector = ({
  value,
  onSelect,
  market,
  errorMessage,
}: TypeSelectorProps) => {
  const renderError = (errorType: MarketModeValidationType) => {
    if (errorType === MarketModeValidationType.Auction) {
      return t('Only limit orders are permitted when market is in auction');
    }

    if (errorType === MarketModeValidationType.LiquidityMonitoringAuction) {
      return (
        <span>
          {t('This market is in auction until it reaches')}{' '}
          <Tooltip description={<DataGrid grid={compileGridData(market)} />}>
            <span>{t('sufficient liquidity')}</span>
          </Tooltip>
          {'. '}
          {t('Only limit orders are permitted when market is in auction')}
        </span>
      );
    }

    if (errorType === MarketModeValidationType.PriceMonitoringAuction) {
      return (
        <span>
          {t('This market is in auction due to')}{' '}
          <Tooltip description={<DataGrid grid={compileGridData(market)} />}>
            <span>{t('high price volatility')}</span>
          </Tooltip>
          {'. '}
          {t('Only limit orders are permitted when market is in auction')}
        </span>
      );
    }

    return null;
  };

  return (
    <FormGroup label={t('Order type')} labelFor="order-type">
      <Toggle
        id="order-type"
        name="order-type"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as Schema.OrderType)}
      />
      {errorMessage && (
        <InputError data-testid="dealticket-error-message-type">
          {renderError(errorMessage as MarketModeValidationType)}
        </InputError>
      )}
    </FormGroup>
  );
};
