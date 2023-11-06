import * as Select from '@radix-ui/react-select';
import { t } from '@vegaprotocol/i18n';
import { TokenIcon, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { isAssetTypeERC20 } from '@vegaprotocol/utils';
import { useAssetBalance } from '@vegaprotocol/deposits';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useState } from 'react';
import type { MarketMaybeWithCandles } from '@vegaprotocol/markets';
import { Markets } from './markets';
import { getMarketsForAsset } from './deposit';

export const AssetSelect = ({
  asset,
  assets,
  onSelect,
  markets,
}: {
  asset?: AssetFieldsFragment;
  assets: AssetFieldsFragment[];
  onSelect: (assetId: string) => void;
  markets: MarketMaybeWithCandles[];
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredAssets = assets
    .filter((a) => a.source.__typename === 'ERC20')
    .filter((a) => a.symbol.toLowerCase().includes(search.toLowerCase()));
  filteredAssets.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-2">
      <Select.Root onValueChange={onSelect} open={open} onOpenChange={setOpen}>
        <Select.Trigger className="flex items-center w-full px-2 py-1 text-left border rounded gap-2 border-vega-clight-400">
          <Trigger
            open={open}
            asset={asset}
            search={search}
            setSearch={(text) => setSearch(text)}
          />
        </Select.Trigger>
        <Select.Content className="min-w-[320px] w-full p-2 mt-2 bg-white border rounded dark:bg-black border-vega-clight-400 dark:border-vega-cdark-400">
          <Select.Group className="flex flex-col gap-2">
            {filteredAssets.length ? (
              filteredAssets.map((a) => (
                <AssetSelectItem key={a.id} asset={a} />
              ))
            ) : (
              <p className="tet-sm">{t('No items')}</p>
            )}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      {asset && <Markets markets={getMarketsForAsset(markets, asset)} />}
    </div>
  );
};

const Trigger = ({
  open,
  asset,
  search,
  setSearch,
}: {
  open: boolean;
  asset?: AssetFieldsFragment;
  search: string;
  setSearch: (text: string) => void;
}) => {
  if (open) {
    return (
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('Search…')}
        // eslint-disable-next-line
        autoFocus={true}
        className="w-full py-0.5 px-1 text-sm outline-none"
      />
    );
  }

  if (asset) {
    return (
      <>
        {isAssetTypeERC20(asset) && (
          <TokenIcon address={asset.source.contractAddress} size={20} />
        )}
        <span>{asset.symbol}</span>
        <span className="text-xs text-muted">{asset.name}</span>
        <span className="text-sm text-muted">
          <AssetBalance asset={asset} />
        </span>
        <span className="ml-auto">
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
        </span>
      </>
    );
  }

  return (
    <>
      <span>{t('Please select')}</span>
      <span className="ml-auto">
        <VegaIcon name={VegaIconNames.CHEVRON_DOWN} />
      </span>
    </>
  );
};

const AssetSelectItem = ({ asset }: { asset: AssetFieldsFragment }) => {
  return (
    <Select.Item
      value={asset.id}
      className="flex items-center px-2 py-1 cursor-pointer gap-2 hover:bg-vega-clight-600 dark:hover:vega-cdark-600 focus:bg-vega-clight-700 dark:focus:bg-vega-cdark-700 rounded-xs"
    >
      {isAssetTypeERC20(asset) && (
        <TokenIcon address={asset.source.contractAddress} />
      )}
      <span>{asset.symbol}</span>
      <span className="text-xs text-muted">{asset.name}</span>
      <span className="ml-auto">
        <AssetBalance asset={asset} />
      </span>
    </Select.Item>
  );
};

const AssetBalance = ({ asset }: { asset: AssetFieldsFragment }) => {
  const balance = useAssetBalance(asset);
  return <>{balance}</>;
};
