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

export const Sort = {
  Gained: 'Gained',
  Lost: 'Lost',
  New: 'New',
  TopTraded: 'TopTraded',
} as const;

export type SortType = keyof typeof Sort;

export const SortTypeMapping: {
  [key in SortType]: string;
} = {
  [Sort.TopTraded]: 'Top traded',
  [Sort.Gained]: 'Top gaining',
  [Sort.Lost]: 'Top losing',
  [Sort.New]: 'New markets',
};

const SortIconMapping: {
  [key in SortType]: VegaIconNames;
} = {
  [Sort.Gained]: VegaIconNames.TREND_UP,
  [Sort.Lost]: VegaIconNames.TREND_DOWN,
  [Sort.New]: VegaIconNames.STAR,
  [Sort.TopTraded]: VegaIconNames.ARROW_UP,
};

export const SortDropdown = ({
  currentSort,
  onSelect,
}: {
  currentSort: SortType;
  onSelect: (sort: SortType) => void;
}) => {
  return (
    <TradingDropdown
      trigger={
        <TradingDropdownTrigger data-testid="sort-trigger">
          <span className="flex items-center justify-between gap-1">
            {SortTypeMapping[currentSort]}
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </span>
        </TradingDropdownTrigger>
      }
    >
      <TradingDropdownContent>
        <TradingDropdownRadioGroup
          value={currentSort}
          onValueChange={(value) => onSelect(value as SortType)}
        >
          {Object.keys(Sort).map((key) => {
            return (
              <TradingDropdownRadioItem
                inset
                key={key}
                value={key}
                data-testid={`sort-item-${key}`}
              >
                <span className="flex gap-2">
                  <VegaIcon name={SortIconMapping[key as SortType]} />{' '}
                  {SortTypeMapping[key as SortType]}
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
