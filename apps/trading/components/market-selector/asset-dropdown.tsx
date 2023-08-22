import { t } from '@vegaprotocol/i18n';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

type Assets = Array<{ id: string; symbol: string }>;

export const AssetDropdown = ({
  assets,
  checkedAssets,
  onSelect,
}: {
  assets: Assets | undefined;
  checkedAssets: string[];
  onSelect: (id: string, checked: boolean) => void;
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
        {assets?.filter(Boolean).map((a) => {
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
  let text = t('Assets');

  if (checkedAssets.length === 1) {
    const assetId = checkedAssets[0];
    const asset = assets.find((a) => a?.id === assetId);
    text = asset ? asset.symbol : t('Asset (1)');
  } else if (checkedAssets.length > 1) {
    text = t(`${checkedAssets.length} Assets`);
  }

  return (
    <span className="flex justify-between items-center">
      {text} <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
    </span>
  );
};
