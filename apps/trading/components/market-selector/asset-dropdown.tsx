import { MultiSelect, MultiSelectOption } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { getChainName } from '@vegaprotocol/web3';

type Assets = Array<{ id: string; symbol: string; chainId?: number }>;

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
    <MultiSelect trigger={triggerText({ assets, checkedAssets }, t)}>
      {assets.map((a) => {
        return (
          <MultiSelectOption
            key={a.id}
            checked={checkedAssets.includes(a.id)}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') {
                onSelect(a.id, checked);
              }
            }}
            data-testid={`asset-id-${a.id}`}
          >
            <span>{a.symbol}</span>{' '}
            <span className="text-xs">({getChainName(a.chainId)})</span>
          </MultiSelectOption>
        );
      })}
    </MultiSelect>
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
    text = asset ? asset.symbol : t('Assets (1)');
  } else if (checkedAssets.length > 1) {
    text = t('Assets ({{count}})', {
      count: checkedAssets.length,
    });
  }

  return text;
};
