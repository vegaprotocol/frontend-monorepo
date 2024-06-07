import { type FormEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import {
  addDecimal,
  removeDecimal,
  roundUpToTickSize,
  toBigNum,
} from '@vegaprotocol/utils';
import { OrderTimeInForce, OrderType, Side } from '@vegaprotocol/types';
import { AssetInput, SwapButton, PriceImpactInput } from './swap-form-elements';
import BigNumber from 'bignumber.js';
import { Links } from '../../lib/links';
import type { Account } from '@vegaprotocol/accounts';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  getBaseAsset,
  getQuoteAsset,
  type MarketDataFieldsFragment,
  type MarketFieldsFragment,
} from '@vegaprotocol/markets';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { getNotionalSize } from '@vegaprotocol/deal-ticket';
import { usePrevious } from '@vegaprotocol/react-helpers';
import { SpotData } from './spot-data';

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
  accounts?: Account[] | null;
  setBaseAsset: (asset?: AssetFieldsFragment) => void;
  setQuoteAsset: (asset?: AssetFieldsFragment) => void;
}) => {
  const t = useT();

  const [quoteAmount, setQuoteAmount] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [tolerance, setTolerance] = useState('');

  const { pubKey, isReadOnly } = useVegaWallet();
  const create = useVegaTransactionStore((state) => state.create);

  const quoteAssetBalance = getQuoteAssetBalance(quoteAsset, accounts);
  const baseAssetBalance = getQuoteAssetBalance(baseAsset, accounts);

  const side = useSide({ market, baseAsset, quoteAsset });

  const marketPrice = useMarketPrice({ marketData, side });
  const prevMarketPrice = usePrevious(marketPrice);

  const handleSwapAssets = () => {
    const newBaseAsset = quoteAsset;
    const newQuoteAsset = baseAsset;
    setBaseAsset(newBaseAsset);
    setQuoteAsset(newQuoteAsset);

    setBaseAmount(quoteAmount);
    setQuoteAmount(baseAmount);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check users is connected
    if (isReadOnly || !pubKey) return;
    if (!Number(quoteAmount)) return;

    if (!market) {
      throw new Error('could not dervie spot market for swap');
    }

    const side = deriveSide({ market, baseAsset, quoteAsset });

    if (!side) {
      throw new Error('could not derive side for swap');
    }

    const toleranceFactor = tolerance ? Number(tolerance) / 100 : 0;
    const price = derivePrice(marketData, side, toleranceFactor, market);

    const orderSubmission = {
      marketId: market.id,
      side,
      type: price ? OrderType.TYPE_LIMIT : OrderType.TYPE_MARKET,
      price: price ? price.toFixed(0) : undefined,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      size: removeDecimal(quoteAmount, market.positionDecimalPlaces),
    };

    create({ orderSubmission });
  };

  useEffect(() => {
    // If we haven't derived a side we can't know how to update the amounts
    if (!side) return;

    // Avoid updating amounts if the current derived price has not changed
    if (marketPrice === prevMarketPrice) return;

    const amount = deriveAmount({
      amount: quoteAmount,
      marketData,
      market,
      baseAsset,
      quoteAsset,
      userValue: 'quote',
    });

    setBaseAmount(amount);
  }, [
    side,
    marketPrice,
    prevMarketPrice,
    baseAsset,
    quoteAsset,
    quoteAmount,
    marketData,
    market,
    baseAmount,
  ]);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      data-testid="swap-form"
      className="flex flex-col gap-4"
    >
      <div className="flex justify-between gap-2 items-center">
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
          amount={quoteAmount}
          onAmountChange={(e) => {
            const quoteAmount = e.target.value;
            const baseAmount = deriveAmount({
              amount: quoteAmount,
              marketData,
              market,
              baseAsset,
              quoteAsset,
              userValue: 'quote',
            });
            setBaseAmount(baseAmount);
            setQuoteAmount(quoteAmount);
          }}
          asset={quoteAsset}
          onAssetChange={(asset) => {
            setQuoteAsset(asset);
          }}
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
          onAssetChange={(asset) => {
            setBaseAsset(asset);
          }}
          onAmountChange={(e) => {
            const baseAmount = e.target.value;
            const quoteAmount = deriveAmount({
              amount: baseAmount,
              marketData,
              market,
              baseAsset,
              quoteAsset,
              userValue: 'base',
            });
            setQuoteAmount(quoteAmount);
            setBaseAmount(baseAmount);
          }}
          accountWarning={false}
          pubKey={pubKey}
          testId="you-receive"
        />
      </div>
      <PriceImpactInput
        value={tolerance}
        onValueChange={(value) => setTolerance(value)}
        data-testid="price-impact-input"
        disabled={!market}
      />

      <TradingButton
        type="submit"
        intent={Intent.Submit}
        data-testid="swap-now-button"
        size="large"
      >
        {t('Swap now')}
      </TradingButton>
      <SpotData
        price={marketPrice}
        market={market}
        side={side}
        quoteAmount={quoteAmount}
        baseAmount={baseAmount}
        quoteAsset={quoteAsset}
        baseAsset={baseAsset}
      />
    </form>
  );
};

/** Derive the amount to be received based on best bid/offer prices */
const deriveAmount = ({
  marketData,
  amount,
  market,
  baseAsset,
  quoteAsset,
  userValue,
}: {
  marketData: MarketDataFieldsFragment | null;
  amount?: string;
  market?: MarketFieldsFragment;
  baseAsset?: AssetFieldsFragment;
  quoteAsset?: AssetFieldsFragment;
  userValue: 'base' | 'quote';
}) => {
  if (!market || !amount) return '';

  const side = deriveSide({ market, baseAsset, quoteAsset, userValue });

  if (side === Side.SIDE_SELL) {
    const price = marketData?.bestBidPrice || '0';
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
    const price = toBigNum(
      marketData?.bestOfferPrice || '0',
      market.decimalPlaces
    );
    return new BigNumber(amount).dividedBy(price).toFixed(8);
  }

  return '';
};

const deriveSide = ({
  market,
  baseAsset,
  quoteAsset,
  userValue,
}: {
  market: MarketFieldsFragment;
  baseAsset?: AssetFieldsFragment;
  quoteAsset?: AssetFieldsFragment;
  userValue?: 'base' | 'quote';
}) => {
  const mQuoteAsset = getQuoteAsset(market);
  const mBaseAsset = getBaseAsset(market);

  // Flip direction if deriving price when the user is editing in flipped state
  if (userValue === 'base') {
    if (mBaseAsset.id === baseAsset?.id && mQuoteAsset.id === quoteAsset?.id) {
      return Side.SIDE_SELL;
    }

    if (mBaseAsset.id === quoteAsset?.id && mQuoteAsset.id === baseAsset?.id) {
      return Side.SIDE_BUY;
    }
  }

  if (mBaseAsset.id === baseAsset?.id && mQuoteAsset.id === quoteAsset?.id) {
    return Side.SIDE_BUY;
  }

  if (mBaseAsset.id === quoteAsset?.id && mQuoteAsset.id === baseAsset?.id) {
    return Side.SIDE_SELL;
  }

  throw new Error(`could not derive side for swap on ${market.id}`);
};

const useSide = ({
  market,
  baseAsset,
  quoteAsset,
}: {
  market?: MarketFieldsFragment;
  baseAsset?: AssetFieldsFragment;
  quoteAsset?: AssetFieldsFragment;
}) => {
  if (!market || !baseAsset || !quoteAsset) return;
  return deriveSide({ market, baseAsset, quoteAsset });
};

const deriveMarketPrice = ({
  side,
  marketData,
}: {
  side?: Side;
  marketData: MarketDataFieldsFragment | null;
}) => {
  if (!marketData) return '0';

  if (side === Side.SIDE_SELL) {
    return marketData.bestBidPrice || '0';
  }

  if (side === Side.SIDE_BUY) {
    return marketData.bestOfferPrice || '0';
  }

  return marketData.lastTradedPrice || '0';
};

const useMarketPrice = ({
  side,
  marketData,
}: {
  side?: Side;
  marketData: MarketDataFieldsFragment | null;
}) => {
  return deriveMarketPrice({ side, marketData });
};
