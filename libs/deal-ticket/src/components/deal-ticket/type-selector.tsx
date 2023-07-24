import {
  FormGroup,
  InputError,
  SimpleGrid,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { RadioGroup, Radio } from '@vegaprotocol/ui-toolkit';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';
import { DealTicketType } from '../../hooks/use-type-store';

interface TypeSelectorProps {
  value: DealTicketType;
  onSelect: (type: DealTicketType) => void;
  market: Market;
  marketData: StaticMarketData;
  errorMessage?: string;
}

const toggles = [
  { label: t('Limit'), value: DealTicketType.Limit },
  { label: t('Market'), value: DealTicketType.Market },
  { label: t('Stop Limit'), value: DealTicketType.StopLimit },
  { label: t('Stop Market'), value: DealTicketType.StopMarket },
];

export const TypeToggle = (props: {
  onChange: (value: string) => void;
  value?: DealTicketType;
}) => (
  <RadioGroup name="order-type" className="mb-2" {...props}>
    {toggles.map(({ label, value }) => (
      <Radio
        value={value}
        key={value}
        id={`order-type-${value}`}
        label={label}
      />
    ))}
  </RadioGroup>
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
        onChange={(value) => {
          onSelect(value as DealTicketType);
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
