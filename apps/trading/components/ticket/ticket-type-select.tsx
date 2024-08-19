import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '@vegaprotocol/ui-toolkit';

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
    'flex-1 -mb-px px-0.5 py-1.5 text-surface-2-fg-muted border-b-2 border-b-transparent';

  const stopOptions = useStopOptions();
  const toggles = useToggles();
  const selectedStopOption = stopOptions.find((t) => t.value === type);

  return (
    <ToggleGroup.Root
      className="flex border-b border-gs-300 dark:border-gs-700"
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
          className={cn(
            toggleClasses,
            'data-[state=on]:border-b-gs-500 data-[state=on]:text-surface-2-fg'
          )}
        >
          {label}
        </ToggleGroup.Item>
      ))}
      <DropdownMenu
        trigger={
          <DropdownMenuTrigger>
            <button
              data-testid="order-type-stop"
              className={cn(
                toggleClasses,
                'flex gap-1 justify-center items-center',
                {
                  'border-b-gs-500': selectedStopOption,
                  'text-surface-2-fg': selectedStopOption,
                }
              )}
            >
              {selectedStopOption ? selectedStopOption.label : t('Stop')}
              <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={14} />
            </button>
          </DropdownMenuTrigger>
        }
      >
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            onValueChange={(value) => onTypeChange(value as TicketType)}
            value={type}
          >
            {stopOptions.map(({ label, value: itemValue }) => (
              <DropdownMenuRadioItem
                key={itemValue}
                value={itemValue}
                textValue={itemValue}
                data-testid={`order-type-${itemValue}`}
              >
                {label}
                <DropdownMenuItemIndicator />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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
