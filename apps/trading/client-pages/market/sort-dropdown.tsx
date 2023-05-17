import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

export const SortDropdown = ({
  currentSort,
  onSelect,
  onReset,
}: {
  currentSort: SortType;
  onSelect: (sort: SortType) => void;
  onReset: () => void;
}) => {
  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger data-testid="sort-trigger">
          <VegaIcon name={VegaIconNames.TREND_UP} />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={currentSort}
          onValueChange={(value) => onSelect(value as SortType)}
        >
          <DropdownMenuItem onClick={onReset}>{t('Reset')}</DropdownMenuItem>
          <DropdownMenuSeparator />
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
                  {SortTypeMapping[key as SortType]}
                  <DropdownMenuItemIndicator />
                </DropdownMenuRadioItem>
              );
            })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
