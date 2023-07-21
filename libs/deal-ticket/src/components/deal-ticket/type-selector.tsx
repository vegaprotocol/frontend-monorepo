import {
  FormGroup,
  InputError,
  SimpleGrid,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';
import type { ChangeEvent } from 'react';
import { DealTicketType } from '../../hooks/use-type-store';

interface TypeSelectorProps {
  value: DealTicketType;
  onSelect: (type: DealTicketType) => void;
  market: Market;
  marketData: StaticMarketData;
  errorMessage?: string;
}

const toggles = [
  { label: t('L'), value: DealTicketType.Limit },
  { label: t('M'), value: DealTicketType.Market },
  { label: t('SL'), value: DealTicketType.StopLimit },
  { label: t('SM'), value: DealTicketType.StopMarket },
];

export const TypeToggle = ({
  onChange,
  value,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: DealTicketType;
}) => (
  <Toggle
    id="order-type"
    name="order-type"
    toggles={toggles}
    checkedValue={value}
    onChange={onChange}
  />
);

export const TypeSelector = ({
  value,
  onSelect,
  market,
  marketData,
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
          <Tooltip
            description={
              <SimpleGrid grid={compileGridData(market, marketData)} />
            }
          >
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
          <Tooltip
            description={
              <SimpleGrid grid={compileGridData(market, marketData)} />
            }
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
    <FormGroup label={t('Order type')} labelFor="order-type" compact={true}>
      <TypeToggle
        onChange={(e) => {
          onSelect(e.target.value as DealTicketType);
        }}
        value={value}
      />
      {errorMessage && (
        <InputError testId="deal-ticket-error-message-type">
          {renderError(errorMessage as MarketModeValidationType)}
        </InputError>
      )}
    </FormGroup>
  );
};
