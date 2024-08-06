import { AccountType } from '@vegaprotocol/enums';
import type { vegaAccountType } from '@vegaprotocol/rest-clients/dist/trading-data';

import { SubHeader } from '@/components/sub-header';
import { isActiveMarket } from '@/lib/markets';
import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';

import { AssetCard } from './asset-card';

export const locators = {
  noAssets: 'no-assets',
};

export const AssetListEmptyState = ({ publicKey }: { publicKey: string }) => {
  const { assets } = useAssetsStore((state) => ({
    assets: state.assets,
  }));
  const { getMarketsByAssetId } = useMarketsStore((state) => ({
    getMarketsByAssetId: state.getMarketsByAssetId,
  }));
  const sortedAssets = assets
    .map((asset) => ({
      asset,
      markets: asset?.id
        ? getMarketsByAssetId(asset.id).filter((m) => isActiveMarket(m))
        : [],
    }))
    .sort((a, b) => {
      return a.markets.length - b.markets.length;
    });

  const top2Assets = sortedAssets.slice(0, 2);

  return (
    <div>
      <SubHeader content="Balances" />

      <p data-testid={locators.noAssets} className="text-vega-dark-400 my-3">
        Currently you have no assets.
      </p>
      {top2Assets.map(({ asset }) => {
        if (!asset?.id) return null;
        return (
          <AssetCard
            allowZeroAccounts={true}
            key={asset.id}
            accounts={[
              {
                balance: '0',
                asset: asset.id,
                owner: publicKey,
                type: AccountType.ACCOUNT_TYPE_GENERAL as unknown as vegaAccountType,
              },
            ]}
            assetId={asset.id}
          />
        );
      })}
    </div>
  );
};
