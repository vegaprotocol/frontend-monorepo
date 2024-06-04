import { type FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { noop } from 'lodash';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
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
import { useVegaTransactionStore } from '@vegaprotocol/web3';

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
  marketData,
  baseAsset,
  quoteAsset,
  side,
  market,
  accounts,
  assets: spotAssets,
  setBaseAsset,
  setQuoteAsset,
}: {
  market?: MarketFieldsFragment;
  marketData: MarketDataFieldsFragment | null;
  assets: AssetFieldsFragment[];
  baseAsset?: AssetFieldsFragment;
  quoteAsset?: AssetFieldsFragment;
  side?: Side;
  accounts?: Account[] | null;
  setBaseAsset: (asset?: AssetFieldsFragment) => void;
  setQuoteAsset: (asset?: AssetFieldsFragment) => void;
}) => {
  const t = useT();

  const [amount, setAmount] = useState('');
  const [tolerance, setTolerance] = useState('');
  // const { watch, setValue, handleSubmit } = useForm<SwapFields>();
  // const { quoteAmount, priceImpactTolerance } = watch();

  const { pubKey, isReadOnly } = useVegaWallet();
  const create = useVegaTransactionStore((state) => state.create);

  const quoteAssetBalance = getQuoteAssetBalance(quoteAsset, accounts);
  const baseAssetBalance = getQuoteAssetBalance(baseAsset, accounts);

  const marketPrice = useMemo(() => {
    if (!side) {
      return marketData?.lastTradedPrice;
    }

    return side === Side.SIDE_BUY
      ? marketData?.bestOfferPrice // best ask
      : marketData?.bestBidPrice;
  }, [marketData, side]);

  const baseAmount = useDerivedBaseAmount({
    side,
    amount,
    price: marketPrice,
    market,
  });

  const handleSwapAssets = () => {
    const newBaseAsset = quoteAsset;
    const newQuoteAsset = baseAsset;
    setBaseAsset(newBaseAsset);
    setQuoteAsset(newQuoteAsset);
    setAmount(baseAmount);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();

    // Check users is connected
    if (isReadOnly || !pubKey) return;

    if (!side || !market) return;

    const toleranceFactor = tolerance ? Number(tolerance) / 100 : 0;

    const price = derivePrice(marketData, side, toleranceFactor, market);

    const orderSubmission = {
      marketId: market.id,
      side,
      type: price ? OrderType.TYPE_LIMIT : OrderType.TYPE_MARKET,
      price: price ? price.toFixed(0) : undefined,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      size: removeDecimal(amount, market.positionDecimalPlaces),
    };

    create({ orderSubmission });
  };

  return (
    <form onSubmit={onSubmit} noValidate data-testid="swap-form">
      <div className="flex justify-between gap-2 items-center mb-4">
        <h3 className="text-lg">{t('Swap')}</h3>
        {market?.id && (
          <Link
            to={Links.MARKET(market.id)}
            className="flex items-center gap-2"
          >
            {t('Go to market')}{' '}
            <VegaIcon name={VegaIconNames.ARROW_TOP_RIGHT} />
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <AssetInput
          label={t('You pay')}
          amount={amount}
          onAmountChange={(e) => setAmount(e.target.value)}
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
          onAmountChange={noop}
          accountWarning={false}
          pubKey={pubKey}
          testId="you-receive"
        />
      </div>
      <PriceImpactInput
        value={tolerance}
        onValueChange={(value) => setTolerance(value)}
        data-testid="price-impact-input"
      />

      <button
        // TODO: this button should be a TradingButton with a new variant for the rich blue color
        type="submit"
        className="w-full hover:bg-vega-blue-600 bg-vega-blue-500 p-4 rounded-lg text-white"
        data-testid="swap-now-button"
      >
        {t('Swap now')}
      </button>
      <div className="mt-4 text-left text-gray-500">
        {quoteAsset &&
          amount &&
          baseAsset &&
          baseAmount &&
          `${formatNumber(amount, 4)} ${quoteAsset.symbol} = ${formatNumber(
            baseAmount,
            4
          )} ${baseAsset.symbol}`}
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

/** Derive the amount to be received based on best bid/offer prices */
const useDerivedBaseAmount = ({
  side,
  amount,
  price,
  market,
}: {
  side?: Side;
  amount?: string;
  price?: string;
  market?: MarketFieldsFragment;
}) => {
  if (!market || !amount) return '';

  if (side === Side.SIDE_SELL) {
    const notionalSize = getNotionalSize(
      price,
      removeDecimal(amount, market.positionDecimalPlaces),
      market.decimalPlaces,
      market.positionDecimalPlaces,
      market.decimalPlaces
    );
    return notionalSize ? addDecimal(notionalSize, market.decimalPlaces) : '';
  }

  if (side === Side.SIDE_BUY) {
    const shiftedPrice = price ? addDecimal(price, market.decimalPlaces) : 0;
    return (Number(amount) / (Number(shiftedPrice) || 1)).toString();
  }

  return '';
};
