import { t } from '@vegaprotocol/i18n';
import {
  TradingDropdown,
  TradingDropdownCheckboxItem,
  TradingDropdownContent,
  TradingDropdownItemIndicator,
  TradingDropdownTrigger,
} from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { MarketSelectorButton } from './market-selector-button';

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
    <TradingDropdown
      trigger={
        <TradingDropdownTrigger data-testid="asset-trigger">
          <MarketSelectorButton>
            {triggerText({ assets, checkedAssets })}
          </MarketSelectorButton>
        </TradingDropdownTrigger>
      }
    >
      <TradingDropdownContent>
        {assets?.map((a) => {
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
  );
};

const triggerText = ({
  assets,
  checkedAssets,
}: {
  assets: Assets;
  checkedAssets: string[];
}) => {
  let text = t('Assets');

  if (checkedAssets.length === 1) {
    const assetId = checkedAssets[0];
    const asset = assets.find((a) => a.id === assetId);
    text = asset ? asset.symbol : t('Asset (1)');
  } else if (checkedAssets.length > 1) {
    text = t(`${checkedAssets.length} Assets`);
  }

  return text;
};
