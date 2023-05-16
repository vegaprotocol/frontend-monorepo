import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
} from '@vegaprotocol/ui-toolkit';

export const AssetDropdown = ({
  assets,
  checkedAssets,
  onSelect,
  onReset,
}: {
  assets: Array<{ id: string; symbol: string }> | undefined;
  checkedAssets: string[];
  onSelect: (id: string, checked: boolean) => void;
  onReset: () => void;
}) => {
  if (!assets?.length) {
    return null;
  }

  return (
    <DropdownMenu
      trigger={
        <DropdownMenuTrigger iconName="dollar" data-testid="asset-trigger" />
      }
    >
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onReset}>{t('Reset')}</DropdownMenuItem>
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
              data-testid={`asset-id-${a.id}`}
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
