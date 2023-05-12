import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';

export const AssetDropdown = ({
  assets,
  checkedAssets,
  onSelect,
}: {
  assets: Array<{ id: string; symbol: string }> | undefined;
  checkedAssets: string[];
  onSelect: (id: string, checked: boolean) => void;
}) => {
  if (!assets?.length) {
    return null;
  }

  return (
    <DropdownMenu trigger={<DropdownMenuTrigger iconName="dollar" />}>
      <DropdownMenuContent>
        {assets?.map((a) => {
          return (
            <DropdownMenuCheckboxItem
              key={a.id}
              checked={checkedAssets.includes(a.id)}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  onSelect(a.id, checked);
                }
              }}
            >
              {a.symbol}
              <DropdownMenuItemIndicator />
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
