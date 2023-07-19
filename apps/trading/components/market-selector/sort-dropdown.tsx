import { t } from '@vegaprotocol/i18n';
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

export const Sort = {
  None: 'None',
  Gained: 'Gained',
  Lost: 'Lost',
  New: 'New',
} as const;

export type SortType = keyof typeof Sort;

export const SortTypeMapping: {
  [key in SortType]: string;
} = {
  [Sort.None]: 'None',
  [Sort.Gained]: 'Top gaining',
  [Sort.Lost]: 'Top losing',
  [Sort.New]: 'New markets',
};

const SortIconMapping: {
  [key in SortType]: VegaIconNames;
} = {
  [Sort.None]: null as unknown as VegaIconNames, // not shown in list
  [Sort.Gained]: VegaIconNames.TREND_UP,
  [Sort.Lost]: VegaIconNames.TREND_DOWN,
  [Sort.New]: VegaIconNames.STAR,
};

export const SortDropdown = ({
  currentSort,
  onSelect,
}: {
  currentSort: SortType;
  onSelect: (sort: SortType) => void;
}) => {
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger data-testid="sort-trigger">
          <span className="flex justify-between items-center">
            {currentSort === SortTypeMapping.None
              ? t('Sort')
              : SortTypeMapping[currentSort]}{' '}
            <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
          </span>
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={currentSort}
          onValueChange={(value) => onSelect(value as SortType)}
        >
          {Object.keys(Sort)
            .filter((s) => s !== Sort.None)
            .map((key) => {
              return (
                <DropdownMenuRadioItem
                  inset
                  key={key}
                  value={key}
                  data-testid={`sort-item-${key}`}
                >
                  <span className="flex gap-2">
                    <VegaIcon name={SortIconMapping[key as SortType]} />{' '}
                    {SortTypeMapping[key as SortType]}
                  </span>
                  <DropdownMenuItemIndicator />
                </DropdownMenuRadioItem>
              );
            })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
