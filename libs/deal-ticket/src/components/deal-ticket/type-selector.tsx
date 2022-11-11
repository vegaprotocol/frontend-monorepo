import { FormGroup, InputError, Tooltip } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import { compileGridData, MarketDataGrid } from '../trading-mode-tooltip';
import type { DealTicketMarketFragment } from './__generated__/DealTicket';

interface TypeSelectorProps {
  value: Schema.OrderType;
  onSelect: (type: Schema.OrderType) => void;
  market: DealTicketMarketFragment;
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
  const renderError = (errorType: string) => {
    if (errorType === 'auction') {
      return t('Only limit orders are permitted when market is in auction');
    }

    if (errorType === 'liquidity') {
      return (
        <span>
          {t('This market is in auction until it reaches')}{' '}
          <Tooltip
            description={<MarketDataGrid grid={compileGridData(market)} />}
          >
            <span>{t('sufficient liquidity')}</span>
          </Tooltip>
          {'. '}
          {t('Only limit orders are permitted when market is in auction')}
        </span>
      );
    }

    if (errorType === 'price') {
      return (
        <span>
          {t('This market is in auction due to')}{' '}
          <Tooltip
            description={<MarketDataGrid grid={compileGridData(market)} />}
          >
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
      {errorMessage && <InputError>{renderError(errorMessage)}</InputError>}
    </FormGroup>
  );
};
