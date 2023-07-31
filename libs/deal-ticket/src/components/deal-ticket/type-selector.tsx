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
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { FLAGS } from '@vegaprotocol/environment';

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
        id={`order-type-${itemValue}`}
        data-testid={`order-type-${itemValue}`}
        asChild
      >
        <button
          className={classNames('flex-1 relative rounded', {
            'bg-vega-clight-500 dark:bg-vega-cdark-500': value === itemValue,
          })}
        >
          {label}
        </button>
      </RadioGroup.Item>
    ))}
    {FLAGS.STOP_ORDERS && (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          data-testid="order-type-Stop"
          className={classNames('flex-1 rounded', {
            'bg-vega-cdark-500': options.some((t) => t.value === value),
          })}
        >
          {t('Stop')}
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-vega-cdark-50 leading-10 font-alpha text-sm rounded shadow p-1">
            <DropdownMenu.RadioGroup
              onValueChange={(value) => onValueChange(value as DealTicketType)}
              value={options.find((t) => t.value === value) ? value : undefined}
            >
              {options.map(({ label, value }) => (
                <DropdownMenu.RadioItem
                  key={value}
                  value={value}
                  textValue={label}
                  id={`order-type-${value}`}
                  data-testid={`order-type-${value}`}
                  className="hover:bg-vega-cdark-200 text-vega-cdark-900 bg-vega-cdark-50 rounded pl-1 pr-10 relative"
                >
                  <DropdownMenu.ItemIndicator className="absolute right-0 top-0 bottom-0 inline-flex items-center justify-center pr-1">
                    <Icon name="tick" />
                  </DropdownMenu.ItemIndicator>
                  {label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )}
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
