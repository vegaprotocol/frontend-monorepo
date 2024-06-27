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
import { DealTicketType } from '@vegaprotocol/react-helpers';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
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
  const stopOptions = useOptions();
  const toggles = useToggles();
  const selectedStopOption = stopOptions.find((t) => t.value === value);
  const showStopOrdersDropdown = featureFlags.STOP_ORDERS;
  const toggleClasses = 'flex-1 px-2 -mb-px';

  return (
    <ToggleGroup.Root
      className="flex h-8 leading-8 font-alpha text-xs border-b border-default"
      type="single"
      value={value}
      onValueChange={onValueChange}
    >
      {toggles.map(({ label, value: itemValue }) => (
        <ToggleGroup.Item
          value={itemValue}
          key={itemValue}
          id={`order-type-${itemValue}`}
          data-testid={`order-type-${itemValue}`}
          className={classNames(
            toggleClasses,
            'data-[state=on]:border-b-vega-clight-400 dark:data-[state=on]:border-b-vega-cdark-400 data-[state=on]:border-b-2'
          )}
        >
          {label}
        </ToggleGroup.Item>
      ))}
      {showStopOrdersDropdown && (
        <TradingDropdown
          trigger={
            <TradingDropdownTrigger>
              <button
                id="order-type-stop"
                data-testid="order-type-Stop"
                className={classNames(
                  toggleClasses,
                  'flex gap-1 justify-center items-center',
                  {
                    'border-b-2 border-b-vega-clight-400 dark:border-b-vega-cdark-400':
                      selectedStopOption,
                  }
                )}
              >
                {selectedStopOption ? selectedStopOption.label : t('Stop')}
                <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
              </button>
            </TradingDropdownTrigger>
          }
        >
          <TradingDropdownPortal>
            <TradingDropdownContent align="end">
              <TradingDropdownRadioGroup
                onValueChange={(value) =>
                  onValueChange(value as DealTicketType)
                }
                value={value}
              >
                {stopOptions.map(({ label, value: itemValue }) => (
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
    </ToggleGroup.Root>
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
