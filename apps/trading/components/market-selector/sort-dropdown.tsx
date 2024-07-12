import {
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItemIndicator,
  TradingDropdownRadioGroup,
  TradingDropdownRadioItem,
  TradingDropdownTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { MarketSelectorButton } from './market-selector-button';
import {
  type ISortOption,
  SortOption,
} from '../../lib/hooks/use-market-filters';

export const SortTypeMapping: {
  [key in ISortOption]: string;
} = {
  [SortOption.TOP_TRADED]: 'Top traded',
  [SortOption.GAINED]: 'Top gaining',
  [SortOption.LOST]: 'Top losing',
  [SortOption.NEW]: 'New markets',
};

const SortIconMapping: {
  [key in ISortOption]: VegaIconNames;
} = {
  [SortOption.TOP_TRADED]: VegaIconNames.TREND_UP,
  [SortOption.GAINED]: VegaIconNames.TREND_DOWN,
  [SortOption.LOST]: VegaIconNames.STAR,
  [SortOption.NEW]: VegaIconNames.ARROW_UP,
};

export const SortDropdown = ({
  currentSort,
  onSelect,
}: {
  currentSort: ISortOption;
  onSelect: (sortOrder: ISortOption) => void;
}) => {
  const options = [
    SortOption.GAINED,
    SortOption.LOST,
    SortOption.NEW,
    SortOption.TOP_TRADED,
  ];

  return (
    <TradingDropdown
      trigger={
        <TradingDropdownTrigger data-testid="sort-trigger">
          <MarketSelectorButton>
            {SortTypeMapping[currentSort]}
          </MarketSelectorButton>
        </TradingDropdownTrigger>
      }
    >
      <TradingDropdownContent>
        <TradingDropdownRadioGroup
          value={currentSort}
          onValueChange={(value) => onSelect(value as ISortOption)}
        >
          {options.map((option) => {
            return (
              <TradingDropdownRadioItem
                inset
                key={option}
                value={option}
                data-testid={`sort-item-${option}`}
              >
                <span className="flex gap-2">
                  <VegaIcon name={SortIconMapping[option]} />{' '}
                  {SortTypeMapping[option]}
                </span>
                <TradingDropdownItemIndicator />
              </TradingDropdownRadioItem>
            );
          })}
        </TradingDropdownRadioGroup>
      </TradingDropdownContent>
    </TradingDropdown>
  );
};
