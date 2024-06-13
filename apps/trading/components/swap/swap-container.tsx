import uniqBy from 'lodash/uniqBy';
import { useState } from 'react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  getBaseAsset,
  getQuoteAsset,
  isSpot,
  marketDataProvider,
  useMarketsMapProvider,
  type MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useAggregatedAccounts } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { SwapForm } from './swap-form';

export const SwapContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const { data: accounts } = useAggregatedAccounts(pubKey);

  const [topAsset, setTopAsset] = useState<AssetFieldsFragment>();
  const [bottomAsset, setBottomAsset] = useState<AssetFieldsFragment>();

  const spotMarkets = Object.values(markets || {}).filter((m) =>
    isSpot(m.tradableInstrument.instrument.product)
  );
  const assets = spotMarkets
    .map((m) => {
      const baseAsset = getBaseAsset(m);
      const quoteAsset = getQuoteAsset(m);
      return [baseAsset, quoteAsset];
    })
    .flat();
  const spotAssets = uniqBy(assets, 'id');

  const market = useSwapMarket({ markets: spotMarkets, topAsset, bottomAsset });

  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market?.id || '' },
    skip: !market?.id,
  });

  return (
    <SwapForm
      market={market}
      marketData={marketData}
      bottomAsset={bottomAsset}
      setBottomAsset={setBottomAsset}
      topAsset={topAsset}
      setTopAsset={setTopAsset}
      accounts={accounts}
      // TODO: Update market queries and assets list query to use AssetFieldsFragment
      assets={spotAssets as AssetFieldsFragment[]}
    />
  );
};

/**
 * Return the spot market that can be used to swap the
 * two provided assets
 */
const useSwapMarket = ({
  markets,
  topAsset,
  bottomAsset,
}: {
  markets: MarketFieldsFragment[];
  topAsset?: AssetFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
}) => {
  if (!topAsset || !bottomAsset) return;

  return markets.find((m) => {
    const baseAsset = getBaseAsset(m);
    const quoteAsset = getQuoteAsset(m);

    if (baseAsset.id === bottomAsset.id && quoteAsset.id === topAsset.id) {
      return true;
    }

    if (baseAsset.id === topAsset.id && quoteAsset.id === bottomAsset.id) {
      return true;
    }

    return false;
  });
};
