import uniqBy from 'lodash/uniqBy';
import { useState } from 'react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  getBaseAsset,
  getQuoteAsset,
  isSpot,
  marketDataProvider,
  useMarketsMapProvider,
} from '@vegaprotocol/markets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useAggregatedAccounts } from '@vegaprotocol/accounts';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { SwapForm } from './swap-form';
import { Loader, Splash } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';
import { Links } from '../../lib/links';

export const SwapContainer = ({ assetId }: { assetId?: string }) => {
  const { pubKey } = useVegaWallet();
  const { data: markets, loading } = useMarketsMapProvider();
  const { data: accounts } = useAggregatedAccounts(pubKey);
  const navigate = useNavigate();
  const onDeposit = () => navigate(Links.DEPOSIT());

  const [marketId, setMarketId] = useState<string>();

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

  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId: marketId || '' },
    skip: !marketId,
  });

  if (loading) {
    return (
      <Splash>
        <Loader />
      </Splash>
    );
  }

  return (
    <SwapForm
      initialAssetId={assetId}
      markets={spotMarkets}
      marketData={marketData}
      accounts={accounts}
      // TODO: Update market queries and assets list query to use AssetFieldsFragment
      assets={spotAssets as AssetFieldsFragment[]}
      setCurrentMarketId={(marketId) => setMarketId(marketId)}
      onDeposit={onDeposit}
    />
  );
};
