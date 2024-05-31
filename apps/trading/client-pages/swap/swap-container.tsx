import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  type MarketDataFieldsFragment,
  type MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { VegaIcon, VegaIconNames, Link } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useAccounts, type Account } from '@vegaprotocol/accounts';
import { useT } from '../../lib/use-t';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  removeDecimal,
} from '@vegaprotocol/utils';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import noop from 'lodash/noop';
import { getNotionalSize } from '@vegaprotocol/deal-ticket';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AssetInput, SwapButton, PriceImpactInput } from './swap-form';
import BigNumber from 'bignumber.js';

const POLLING_TIME = 5000;

const assetBalance = (
  asset?: AssetFieldsFragment,
  accounts?: Account[] | null
) => {
  if (!asset || !accounts) return undefined;
  const account = accounts.find((a) => a.asset.id === asset.id);
  return account?.balance;
};

export interface SwapFields {
  baseId: string;
  quoteId: string;
  baseAmount: string;
  quoteAmount: string;
  priceImpactTolerance: string;
}

const derivePrice = (
  marketData: MarketDataFieldsFragment | null,
  side: Side,
  toleranceFactor: number,
  market: MarketFieldsFragment
) => {
  if (!marketData) return;
  const price =
    side === Side.SIDE_BUY
      ? new BigNumber(marketData.bestOfferPrice).times(1 + toleranceFactor)
      : new BigNumber(marketData.bestBidPrice).times(1 - toleranceFactor);

  // const priceStep = determinePriceStep(market);

  // while (
  //   price &&
  //   !validateAgainstStep(priceStep, price.toString()) &&
  //   toleranceFactor > 0
  // ) {
  //   if (side === Side.SIDE_BUY) {
  //     price.plus(1);
  //   } else {
  //     price.minus(1);
  //   }
  // }
  return price;
};

export const SwapContainer = () => {
  const t = useT();
  const { watch, setValue, handleSubmit } = useForm<SwapFields>();
  const { baseAmount, quoteAmount, priceImpactTolerance } = watch();

  const { pubKey, isReadOnly } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const { data: assetsData } = useAssetsMapProvider();

  const create = useVegaTransactionStore((state) => state.create);

  const [quoteAsset, setQuoteAsset] = useState<AssetFieldsFragment>();
  const [baseAsset, setBaseAsset] = useState<AssetFieldsFragment>();
  const [side, setSide] = useState<Side>();
  const [marketId, setMarketId] = useState<string>('');
  const [market, setMarket] = useState<MarketFieldsFragment>();

  const { data: marketData, reload: reloadMarketData } = useDataProvider({
    dataProvider: marketDataProvider,
    variables: { marketId },
    skip: !marketId,
  });
  const { data: accounts, reload: reloadAccounts } = useAccounts(pubKey);

  useEffect(() => {
    const intervalAccounts = setInterval(reloadAccounts, POLLING_TIME);
    const intervalMarketData = setInterval(reloadMarketData, POLLING_TIME);
    return () => {
      clearInterval(intervalAccounts);
      clearInterval(intervalMarketData);
    };
  }, [reloadAccounts, reloadMarketData]);

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

  const accountAssetIds = accounts?.map((a) => a.asset.id);

  const quoteAssetBalance = useMemo(
    () => assetBalance(quoteAsset, accounts),
    [accounts, quoteAsset]
  );
  const baseAssetBalance = useMemo(
    () => assetBalance(baseAsset, accounts),
    [accounts, baseAsset]
  );

  const marketPrice = useMemo(() => {
    return (
      (side === Side.SIDE_BUY
        ? marketData?.bestOfferPrice // best ask
        : marketData?.bestBidPrice) || // best bid
      marketData?.lastTradedPrice
    );
  }, [marketData, side]);

  const orderSubmission = useMemo(() => {
    if (!market || !side || !quoteAmount || quoteAmount === '0') return;

    const toleranceFactor = priceImpactTolerance
      ? Number(priceImpactTolerance) / 100
      : 0;

    const price = derivePrice(marketData, side, toleranceFactor, market);

    return {
      marketId,
      side,
      type: price ? OrderType.TYPE_LIMIT : OrderType.TYPE_MARKET,
      price: price ? price.toFixed(0) : undefined,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      size: removeDecimal(quoteAmount, market.positionDecimalPlaces),
    };
  }, [market, marketData, marketId, priceImpactTolerance, quoteAmount, side]);

  useEffect(() => {
    const market = chooseMarket();
    setMarketId(market?.id || '');
    setMarket(market);
  }, [chooseMarket, setMarketId, setMarket]);

  const switchAssets = () => {
    const newBaseAsset = quoteAsset;
    const newQuoteAsset = baseAsset;
    setBaseAsset(newBaseAsset);
    setQuoteAsset(newQuoteAsset);
    newBaseAsset && newQuoteAsset && chooseMarket();
  };

  const switchAmounts = () => {
    setValue('quoteAmount', baseAmount);
  };

  const onSubmit = () => {
    if (!marketId || !side || !market || !orderSubmission) return;
    create({ orderSubmission });
  };

  useEffect(() => {
    if (!orderSubmission || !market) return;
    if (side === Side.SIDE_SELL && quoteAsset) {
      const notionalSize = getNotionalSize(
        marketPrice,
        orderSubmission.size,
        market.decimalPlaces,
        market.positionDecimalPlaces,
        market.decimalPlaces
      );
      const baseAmount =
        notionalSize && addDecimal(notionalSize, market.decimalPlaces);
      setValue('baseAmount', baseAmount || '');
    } else if (side === Side.SIDE_BUY) {
      const price =
        marketPrice && addDecimal(marketPrice, market.decimalPlaces);
      const baseAmount = Number(quoteAmount) / (Number(price) || 1);
      setValue('baseAmount', baseAmount.toString());
    }
  }, [
    market,
    marketPrice,
    quoteAmount,
    side,
    setValue,
    orderSubmission,
    quoteAsset,
  ]);

  return (
    <form
      onSubmit={!isReadOnly && pubKey ? handleSubmit(onSubmit) : noop}
      noValidate
      data-testid="swap-form"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">{t('Swap')}</h3>
        {marketId && (
          <Link
            href={`/#/markets/${marketId}`}
            className="text-sm text-gray-500 text-right"
          >
            {t('Go to market')} <VegaIcon name={VegaIconNames.ARROW_RIGHT} />
          </Link>
        )}
      </div>
      <div className="flex flex-col w-full gap-2">
        <AssetInput
          label={t('You pay')}
          amount={quoteAmount || ''}
          onAmountChange={(e) => setValue('quoteAmount', e.target.value)}
          asset={quoteAsset}
          onAssetChange={setQuoteAsset}
          balance={quoteAssetBalance}
          accountAssetIds={accountAssetIds}
          assets={spotAssets}
          pubKey={pubKey}
        />
        <SwapButton
          onClick={() => {
            switchAssets();
            switchAmounts();
          }}
        />
        <AssetInput
          label={t('You receive')}
          amount={baseAmount || ''}
          asset={baseAsset}
          balance={baseAssetBalance}
          accountAssetIds={accountAssetIds}
          assets={spotAssets}
          onAssetChange={setBaseAsset}
          onAmountChange={(e) => setValue('baseAmount', e.target.value)}
          accountWarning={false}
          pubKey={pubKey}
        />
      </div>
      <PriceImpactInput
        value={priceImpactTolerance || ''}
        onValueChange={(e) => setValue('priceImpactTolerance', e)}
      />
      <button
        type="submit"
        className="w-full hover:bg-vega-blue-600 bg-vega-blue-500 p-4 rounded-lg text-white"
      >
        {t('Swap now')}
      </button>
      <div className="mt-4 text-left text-gray-500">
        {quoteAsset &&
          quoteAmount &&
          baseAsset &&
          baseAmount &&
          `${formatNumber(quoteAmount, 4)} ${
            quoteAsset.symbol
          } = ${formatNumber(baseAmount, 4)} ${baseAsset.symbol}`}
      </div>

      <div className="mt-2 text-left text-gray-500">
        {marketPrice &&
          market &&
          `${side === Side.SIDE_BUY ? t('Best ask') : t('Best bid')} ${
            market?.tradableInstrument.instrument.code
          }: ${addDecimalsFormatNumber(marketPrice, market.decimalPlaces)}`}
      </div>
    </form>
  );
};
