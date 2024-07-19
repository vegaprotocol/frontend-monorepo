import {
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
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import classNames from 'classnames';

import { useT } from '../../lib/use-t';
import { type TicketType } from './schemas';

export const TicketTypeSelect = ({
  type,
  onTypeChange,
}: {
  type: TicketType;
  onTypeChange: (type: TicketType) => void;
}) => {
  const t = useT();
  const toggleClasses =
    'flex-1 -mb-px px-0.5 py-1.5 border-b-2 border-b-transparent text-secondary';

  const stopOptions = useStopOptions();
  const toggles = useToggles();
  const selectedStopOption = stopOptions.find((t) => t.value === type);

  return (
    <ToggleGroup.Root
      className="flex border-b border-default"
      type="single"
      value={type}
      onValueChange={(type) => {
        if (!type) return;
        onTypeChange(type as TicketType);
      }}
    >
      {toggles.map(({ label, value: itemValue }) => (
        <ToggleGroup.Item
          value={itemValue}
          key={itemValue}
          data-testid={`order-type-${itemValue}`}
          className={classNames(
            toggleClasses,
            'data-[state=on]:border-b-vega-clight-400 dark:data-[state=on]:border-b-vega-cdark-400 data-[state=on]:text-vega-clight-50 dark:data-[state=on]:text-vega-cdark-50'
          )}
        >
          {label}
        </ToggleGroup.Item>
      ))}
      <TradingDropdown
        trigger={
          <TradingDropdownTrigger>
            <button
              data-testid="order-type-stop"
              className={classNames(
                toggleClasses,
                'flex gap-1 justify-center items-center',
                {
                  'border-b-vega-clight-400 dark:border-b-vega-cdark-400':
                    selectedStopOption,
                  'text-vega-clight-50 dark:text-vega-cdark-50':
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
              onValueChange={(value) => onTypeChange(value as TicketType)}
              value={type}
            >
              {stopOptions.map(({ label, value: itemValue }) => (
                <TradingDropdownRadioItem
                  key={itemValue}
                  value={itemValue}
                  textValue={itemValue}
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
    </ToggleGroup.Root>
  );
};

const useToggles = () => {
  const t = useT();
  return [
    { label: t('Limit'), value: 'limit' },
    { label: t('Market'), value: 'market' },
  ];
};
const useStopOptions = () => {
  const t = useT();
  return [
    { label: t('Stop Limit'), value: 'stopLimit' },
    { label: t('Stop Market'), value: 'stopMarket' },
  ];
};
