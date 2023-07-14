import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@vegaprotocol/ui-toolkit';

type Assets = Array<{ id: string; symbol: string }>;

export const AssetDropdown = ({
  assets,
  checkedAssets,
  onSelect,
  onReset,
}: {
  assets: Assets | undefined;
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
        <DropdownMenuTrigger data-testid="asset-trigger">
          <TriggerText assets={assets} checkedAssets={checkedAssets} />
        </DropdownMenuTrigger>
      }
    >
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onReset}>{t('Reset')}</DropdownMenuItem>
        <DropdownMenuSeparator />
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

const TriggerText = ({
  assets,
  checkedAssets,
}: {
  assets: Assets;
  checkedAssets: string[];
}) => {
  let text = t('Asset');

  if (checkedAssets.length === 1) {
    const assetId = checkedAssets[0];
    const asset = assets.find((a) => a.id === assetId);
    text = asset ? asset.symbol : t('Asset (1)');
  } else if (checkedAssets.length > 1) {
    text = t(`Asset (${checkedAssets.length})`);
  }

  return <span className="px-1">{text}</span>;
};
