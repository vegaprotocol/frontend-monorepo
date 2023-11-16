import {
  TradingDropdown,
  TradingDropdownCheckboxItem,
  TradingDropdownContent,
  TradingDropdownItemIndicator,
  TradingDropdownTrigger,
} from '@vegaprotocol/ui-toolkit';
import { MarketSelectorButton } from './market-selector-button';
import { useT } from '../../lib/use-t';

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
  const t = useT();
  if (!assets?.length) {
    return null;
  }

  return (
    assets && (
      <TradingDropdown
        trigger={
          <TradingDropdownTrigger data-testid="asset-trigger">
            <MarketSelectorButton>
              {triggerText({ assets, checkedAssets }, t)}
            </MarketSelectorButton>
          </TradingDropdownTrigger>
        }
      >
        <TradingDropdownContent>
          {assets.filter(Boolean).map((a) => {
            return (
              <TradingDropdownCheckboxItem
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
                <TradingDropdownItemIndicator />
              </TradingDropdownCheckboxItem>
            );
          })}
        </TradingDropdownContent>
      </TradingDropdown>
    )
  );
};

const triggerText = (
  {
    assets,
    checkedAssets,
  }: {
    assets: Assets;
    checkedAssets: string[];
  },
  t: ReturnType<typeof useT>
) => {
  let text = t('Assets');

  if (checkedAssets.length === 1) {
    const assetId = checkedAssets[0];
    const asset = assets.find((a) => a.id === assetId);
    text = asset ? asset.symbol : t('Asset (1)');
  } else if (checkedAssets.length > 1) {
    text = t('{{checkedAssets}} Assets', {
      checkedAssets: checkedAssets.length,
    });
  }

  return text;
};
