import {
  TradingInputError,
  SimpleGrid,
  TextChildrenTooltip as Tooltip,
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItemIndicator,
  TradingDropdownPortal,
  TradingDropdownRadioGroup,
  TradingDropdownRadioItem,
  TradingDropdownTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import { compileGridData } from '../trading-mode-tooltip';
import { MarketModeValidationType } from '../../constants';
import { DealTicketType } from '../../hooks/use-form-values';
import * as RadioGroup from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { Trans } from 'react-i18next';
import { useT, ns } from '../../use-t';

interface TypeSelectorProps {
  value: DealTicketType;
  onValueChange: (type: DealTicketType) => void;
  market: Market;
  marketData: StaticMarketData;
  errorMessage?: string;
}

const useToggles = () => {
  const t = useT();
  return [
    { label: t('Limit'), value: DealTicketType.Limit },
    { label: t('Market'), value: DealTicketType.Market },
  ];
};
const useOptions = () => {
  const t = useT();
  return [
    { label: t('Stop Limit'), value: DealTicketType.StopLimit },
    { label: t('Stop Market'), value: DealTicketType.StopMarket },
  ];
};

export const TypeToggle = ({
  value,
  onValueChange,
}: Pick<TypeSelectorProps, 'onValueChange' | 'value'>) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const t = useT();
  const options = useOptions();
  const toggles = useToggles();
  const selectedOption = options.find((t) => t.value === value);
  return (
    <RadioGroup.Root
      name="order-type"
      className={classNames('mb-2 grid h-8 leading-8 font-alpha text-xs', {
        'grid-cols-3': featureFlags.STOP_ORDERS,
        'grid-cols-2': !featureFlags.STOP_ORDERS,
      })}
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
      {featureFlags.STOP_ORDERS && (
        <TradingDropdown
          trigger={
            <TradingDropdownTrigger
              data-testid="order-type-Stop"
              className={classNames(
                'rounded px-2 flex flex-nowrap items-center justify-center',
                {
                  'bg-vega-clight-500 dark:bg-vega-cdark-500': selectedOption,
                }
              )}
            >
              <button className="flex gap-1">
                <span className="text-ellipsis whitespace-nowrap shrink overflow-hidden">
                  {selectedOption ? selectedOption.label : t('Stop')}
                </span>
                <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
              </button>
            </TradingDropdownTrigger>
          }
        >
          <TradingDropdownPortal>
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
                    {label}
                    <TradingDropdownItemIndicator />
                  </TradingDropdownRadioItem>
                ))}
              </TradingDropdownRadioGroup>
            </TradingDropdownContent>
          </TradingDropdownPortal>
        </TradingDropdown>
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
  const t = useT();
  const renderError = (errorType: MarketModeValidationType) => {
    if (errorType === MarketModeValidationType.Auction) {
      return t('Only limit orders are permitted when market is in auction');
    }

    if (errorType === MarketModeValidationType.LiquidityMonitoringAuction) {
      return (
        <span>
          <Trans
            i18nKey="TYPE_SELECTOR_LIQUIDITY_MONITORING_AUCTION"
            defaults="This market is in auction until it reaches <0>sufficient liquidity</0>. Only limit orders are permitted when market is in auction."
            ns={ns}
            components={[
              <Tooltip
                description={
                  <SimpleGrid grid={compileGridData(t, market, marketData)} />
                }
              >
                sufficient liquidity
              </Tooltip>,
            ]}
            t={t}
          />
        </span>
      );
    }

    if (errorType === MarketModeValidationType.PriceMonitoringAuction) {
      return (
        <span>
          <Trans
            i18nKey="TYPE_SELECTOR_PRICE_MONITORING_AUCTION"
            defaults="This market is in auction due to <0>high price volatility</0>. Only limit orders are permitted when market is in auction."
            ns={ns}
            components={[
              <Tooltip
                description={
                  <SimpleGrid grid={compileGridData(t, market, marketData)} />
                }
              >
                sufficient liquidity
              </Tooltip>,
            ]}
            t={t}
          />
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
        <TradingInputError testId="deal-ticket-error-message-type">
          {renderError(errorMessage as MarketModeValidationType)}
        </TradingInputError>
      )}
    </>
  );
};
