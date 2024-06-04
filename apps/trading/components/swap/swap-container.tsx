import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAssetsMapProvider,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
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
import { useNavigate } from 'react-router-dom';
import { SwapForm } from './swap-form';
import { Side } from '@vegaprotocol/types';

export const SwapContainer = () => {
  const { pubKey } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const { data: assetsData } = useAssetsMapProvider();
  const { data: accounts } = useAccounts(pubKey);

  const [quoteAsset, setQuoteAsset] = useState<AssetFieldsFragment>();
  const [baseAsset, setBaseAsset] = useState<AssetFieldsFragment>();
  const [side, setSide] = useState<Side>();
  const [marketId, setMarketId] = useState<string>('');
  const [market, setMarket] = useState<MarketFieldsFragment>();

  const { data: marketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId },
    skip: !marketId,
  });
  const navigate = useNavigate();

  const { spotMarkets, spotAssets } = useMemo(() => {
    const spotAssets: Record<string, AssetFieldsFragment> = {};
    if (!markets) return {};
    const spotMarkets = Object.values(markets).filter((m) => {
      if (isSpot(m.tradableInstrument.instrument.product)) {
        const baseAsset = getBaseAsset(m);
        const quoteAsset = getQuoteAsset(m);
        if (baseAsset && assetsData) {
          spotAssets[baseAsset.id] = assetsData[baseAsset.id];
        }
        if (quoteAsset && assetsData) {
          spotAssets[quoteAsset.id] = assetsData[quoteAsset.id];
        }
        return true;
      }
      return false;
    });
    return { spotMarkets, spotAssets };
  }, [assetsData, markets]);

  const chooseMarket = useCallback(() => {
    if (!spotMarkets || !baseAsset || !quoteAsset) return;
    return spotMarkets.find((m) => {
      const mBaseAsset = getBaseAsset(m);
      const mQuoteAsset = getQuoteAsset(m);
      if (!mBaseAsset || !mQuoteAsset) return false;
      if (mBaseAsset.id === baseAsset.id && mQuoteAsset.id === quoteAsset.id) {
        setSide(Side.SIDE_BUY);
        return true;
      }
      if (mBaseAsset.id === quoteAsset.id && mQuoteAsset.id === baseAsset.id) {
        setSide(Side.SIDE_SELL);
        return true;
      }
      return false;
    });
  }, [baseAsset, quoteAsset, spotMarkets]);

  useEffect(() => {
    const market = chooseMarket();
    setMarketId(market?.id || '');
    setMarket(market);
  }, [chooseMarket, setMarketId, setMarket]);

  return (
    <SwapForm
      marketId={marketId}
      marketData={marketData}
      baseAsset={baseAsset}
      setBaseAsset={setBaseAsset}
      quoteAsset={quoteAsset}
      setQuoteAsset={setQuoteAsset}
      side={side}
      market={market}
      navigate={navigate}
      accounts={accounts}
      assets={spotAssets}
      chooseMarket={chooseMarket}
    />
  );
};
