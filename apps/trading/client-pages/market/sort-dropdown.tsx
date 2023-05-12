import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';

export const Sort = {
  None: 'None',
  Gained: 'Gained',
  Lost: 'Lost',
  New: 'New',
} as const;

export type SortType = keyof typeof Sort;

const SortTypeMapping: {
  [key in SortType]: string;
} = {
  [Sort.None]: 'None',
  [Sort.Gained]: 'Top gained',
  [Sort.Lost]: 'Top losing',
  [Sort.New]: 'New markets',
};

export const SortDropdown = ({
  currentSort,
  onSelect,
}: {
  currentSort: SortType;
  onSelect: (sort: SortType) => void;
}) => {
  return (
    <DropdownMenu trigger={<DropdownMenuTrigger iconName="arrow-top-right" />}>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={currentSort}
          onValueChange={(value) => onSelect(value as SortType)}
        >
          {Object.keys(Sort)
            .filter((s) => s !== Sort.None)
            .map((key) => {
              return (
                <DropdownMenuRadioItem inset key={key} value={key}>
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
