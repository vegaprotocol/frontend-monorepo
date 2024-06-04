import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  removeDecimal,
  roundUpToTickSize,
} from '@vegaprotocol/utils';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { getNotionalSize } from '@vegaprotocol/deal-ticket';
import { AssetInput, SwapButton, PriceImpactInput } from './swap-form-elements';
import BigNumber from 'bignumber.js';
import { Links } from '../../lib/links';
import type { Account } from '@vegaprotocol/accounts';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import type {
  MarketDataFieldsFragment,
  MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { noop } from 'lodash';
import type { useNavigate } from 'react-router-dom';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

export interface SwapFields {
  baseId: string;
  quoteId: string;
  baseAmount: string;
  quoteAmount: string;
  priceImpactTolerance: string;
}

const getQuoteAssetBalance = (
  asset?: AssetFieldsFragment,
  accounts?: Account[] | null
) => {
  if (!asset || !accounts) return undefined;
  const account = accounts.find((a) => a.asset.id === asset.id);
  return account?.balance;
};

const derivePrice = (
  marketData: MarketDataFieldsFragment | null,
  side: Side,
  toleranceFactor: number,
  market: MarketFieldsFragment
) => {
  if (!marketData) return;
  const isBid = side === Side.SIDE_SELL;
  const price = isBid
    ? new BigNumber(marketData.bestBidPrice).times(1 - toleranceFactor)
    : new BigNumber(marketData.bestOfferPrice).times(1 + toleranceFactor);
  return roundUpToTickSize(price, market.tickSize, isBid);
};

export const SwapForm = ({
  marketId,
  marketData,
  baseAsset,
  quoteAsset,
  side,
  market,
  accounts,
  assets: spotAssets,
  setBaseAsset,
  setQuoteAsset,
  navigate,
  chooseMarket,
}: {
  marketId: string;
  marketData: MarketDataFieldsFragment | null;
  assets?: Record<string, AssetFieldsFragment> | null;
  baseAsset?: AssetFieldsFragment;
  quoteAsset?: AssetFieldsFragment;
  side?: Side;
  market?: MarketFieldsFragment;
  accounts?: Account[] | null;
  chooseMarket: () => void;
  setBaseAsset: (asset?: AssetFieldsFragment) => void;
  setQuoteAsset: (asset?: AssetFieldsFragment) => void;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const t = useT();
  const { watch, setValue, handleSubmit } = useForm<SwapFields>();
  const { quoteAmount, priceImpactTolerance } = watch();

  const { pubKey, isReadOnly } = useVegaWallet();
  const create = useVegaTransactionStore((state) => state.create);

  const quoteAssetBalance = getQuoteAssetBalance(quoteAsset, accounts);
  const baseAssetBalance = getQuoteAssetBalance(baseAsset, accounts);

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

  const baseAmount = useMemo(() => {
    if (!market || !orderSubmission) return '';

    if (side === Side.SIDE_SELL && quoteAsset) {
      const notionalSize = getNotionalSize(
        marketPrice,
        orderSubmission.size,
        market.decimalPlaces,
        market.positionDecimalPlaces,
        market.decimalPlaces
      );
      return notionalSize ? addDecimal(notionalSize, market.decimalPlaces) : '';
    } else if (side === Side.SIDE_BUY) {
      const price = marketPrice
        ? addDecimal(marketPrice, market.decimalPlaces)
        : 0;
      return (Number(quoteAmount) / (Number(price) || 1)).toString();
    }
    return '';
  }, [market, marketPrice, quoteAmount, side, orderSubmission, quoteAsset]);

  const handleSwapAssets = () => {
    const newBaseAsset = quoteAsset;
    const newQuoteAsset = baseAsset;
    setBaseAsset(newBaseAsset);
    setQuoteAsset(newQuoteAsset);
    newBaseAsset && newQuoteAsset && chooseMarket();
    setValue('quoteAmount', baseAmount);
  };

  const onSubmit = () => {
    if (!marketId || !side || !market || !orderSubmission) return;
    create({ orderSubmission });
  };

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
            onClick={() => navigate(Links.MARKET(marketId))}
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
          accountAssetIds={accounts?.map((a) => a.asset.id)}
          assets={spotAssets}
          pubKey={pubKey}
          testId="you-pay"
        />
        <SwapButton onClick={handleSwapAssets} data-testid="swap-button" />
        <AssetInput
          label={t('You receive')}
          amount={baseAmount || ''}
          asset={baseAsset}
          balance={baseAssetBalance}
          accountAssetIds={accounts?.map((a) => a.asset.id)}
          assets={spotAssets}
          onAssetChange={setBaseAsset}
          onAmountChange={(e) => setValue('baseAmount', e.target.value)}
          accountWarning={false}
          pubKey={pubKey}
          testId="you-receive"
        />
      </div>
      <PriceImpactInput
        value={priceImpactTolerance || ''}
        onValueChange={(e) => setValue('priceImpactTolerance', e)}
        data-testid="price-impact-input"
      />
      <button
        type="submit"
        className="w-full hover:bg-vega-blue-600 bg-vega-blue-500 p-4 rounded-lg text-white"
        data-testid="swap-now-button"
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
