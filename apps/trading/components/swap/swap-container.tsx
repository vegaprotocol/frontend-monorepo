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
import { useAccounts } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { SwapForm } from './swap-form';

export const SwapContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const { data: accounts } = useAccounts(pubKey);

  const [quoteAsset, setQuoteAsset] = useState<AssetFieldsFragment>();
  const [baseAsset, setBaseAsset] = useState<AssetFieldsFragment>();

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

  const market = useSwapMarket({ markets: spotMarkets, quoteAsset, baseAsset });

  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: market?.id || '' },
    skip: !market?.id,
  });

  return (
    <SwapForm
      market={market}
      marketData={marketData}
      baseAsset={baseAsset}
      setBaseAsset={setBaseAsset}
      quoteAsset={quoteAsset}
      setQuoteAsset={setQuoteAsset}
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
  quoteAsset,
  baseAsset,
}: {
  markets: MarketFieldsFragment[];
  quoteAsset?: AssetFieldsFragment;
  baseAsset?: AssetFieldsFragment;
}) => {
  if (!quoteAsset || !baseAsset) return;

  return markets.find((m) => {
    const mBaseAsset = getBaseAsset(m);
    const mQuoteAsset = getQuoteAsset(m);

    if (mBaseAsset.id === baseAsset.id && mQuoteAsset.id === quoteAsset.id) {
      return true;
    }

    if (mBaseAsset.id === quoteAsset.id && mQuoteAsset.id === baseAsset.id) {
      return true;
    }

    return false;
  });
};
