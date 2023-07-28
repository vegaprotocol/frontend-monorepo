import {
  Icon,
  InputError,
  SimpleGrid,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';
import { DealTicketType } from '../../hooks/use-type-store';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Select from '@radix-ui/react-select';
import classNames from 'classnames';

interface TypeSelectorProps {
  value: DealTicketType;
  onValueChange: (type: DealTicketType) => void;
  market: Market;
  marketData: StaticMarketData;
  errorMessage?: string;
}

const toggles = [
  { label: t('Limit'), value: DealTicketType.Limit },
  { label: t('Market'), value: DealTicketType.Market },
];
const options = [
  { label: t('Limit'), value: DealTicketType.StopLimit },
  { label: t('Market'), value: DealTicketType.StopMarket },
];

export const TypeToggle = ({
  value,
  onValueChange,
}: Pick<TypeSelectorProps, 'onValueChange' | 'value'>) => (
  <RadioGroup.Root
    name="order-type"
    className="mb-2 flex h-10 leading-10 font-alpha text-sm"
    value={toggles.find((t) => t.value === value) ? value : undefined}
    onValueChange={onValueChange}
  >
    {toggles.map(({ label, value: itemValue }) => (
      <RadioGroup.Item
        value={itemValue}
        key={itemValue}
        id={`order-type-${value}`}
        asChild
      >
        <button
          className={classNames('flex-1 relative rounded', {
            'bg-vega-cdark-500': value === itemValue,
          })}
        >
          {label}
        </button>
      </RadioGroup.Item>
    ))}
    <Select.Root
      onValueChange={onValueChange}
      value={options.find((t) => t.value === value) ? value : undefined}
    >
      <Select.Trigger
        className={classNames('flex-1 rounded', {
          'bg-vega-cdark-500': options.some((t) => t.value === value),
        })}
      >
        <Select.Value placeholder={t('Stop')} />
        <Select.Icon>
          <Icon name="chevron-down" className="ml-2" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-vega-cdark-50 leading-10 font-alpha text-sm rounded shadow">
          <Select.Viewport className="p-2">
            {options.map(({ label, value }) => (
              <Select.Item
                value={value}
                textValue={label}
                className="hover:bg-vega-cdark-200 text-vega-cdark-900 bg-vega-cdark-50 text-center rounded"
              >
                <Select.ItemText>{label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.Arrow />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </RadioGroup.Root>
);

export const TypeSelector = ({
  value,
  onValueChange,
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
    <>
      <TypeToggle
        onValueChange={(value) => {
          onValueChange(value as DealTicketType);
        }}
        value={value}
      />
      {errorMessage && (
        <InputError testId="deal-ticket-error-message-type">
          {renderError(errorMessage as MarketModeValidationType)}
        </InputError>
      )}
    </>
  );
};
