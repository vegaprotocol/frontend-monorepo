import {
  Icon,
  InputError,
  SimpleGrid,
  Tooltip,
  TradingDropdownContent,
  TradingDropdownItemIndicator,
  TradingDropdownRadioGroup,
  TradingDropdownRadioItem,
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
  { label: t('Stop Limit'), value: DealTicketType.StopLimit },
  { label: t('Stop Market'), value: DealTicketType.StopMarket },
];

export const TypeToggle = ({
  value,
  onValueChange,
}: Pick<TypeSelectorProps, 'onValueChange' | 'value'>) => {
  const selectedOption = options.find((t) => t.value === value);
  return (
    <RadioGroup.Root
      name="order-type"
      className="mb-2 grid grid-cols-3 h-8 leading-8 font-alpha text-sm"
      value={value}
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
            className={classNames('rounded', {
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
            className={classNames(
              'rounded px-3 flex flex-nowrap items-center justify-center',
              {
                'bg-vega-clight-500 dark:bg-vega-cdark-500': selectedOption,
              }
            )}
          >
            <span className="text-ellipsis whitespace-nowrap shrink overflow-hidden">
              {t(selectedOption ? selectedOption.label : 'Stop')}
            </span>
            <Icon name="chevron-down" className="ml-1" />
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <TradingDropdownContent>
              <TradingDropdownRadioGroup
                onValueChange={(value) =>
                  onValueChange(value as DealTicketType)
                }
                value={value}
              >
                {options.map(({ label, value: itemValue }) => (
                  <TradingDropdownRadioItem
                    key={itemValue}
                    value={itemValue}
                    textValue={itemValue}
                    id={`order-type-${itemValue}`}
                    data-testid={`order-type-${itemValue}`}
                  >
                    {t(label)}
                    <TradingDropdownItemIndicator />
                  </TradingDropdownRadioItem>
                ))}
              </TradingDropdownRadioGroup>
            </TradingDropdownContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </RadioGroup.Root>
  );
};

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
