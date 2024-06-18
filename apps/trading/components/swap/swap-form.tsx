import { type FormEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
  Notification,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import {
  addDecimal,
  determineSizeStep,
  removeDecimal,
  roundUpToTickSize,
  toBigNum,
} from '@vegaprotocol/utils';
import {
  MarketState,
  OrderTimeInForce,
  OrderType,
  Side,
} from '@vegaprotocol/types';
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

const getAssetBalance = (
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
  initialAssetId,
  marketData,
  markets,
  accounts,
  assets,
  setCurrentMarketId,
}: {
  initialAssetId?: string;
  markets: MarketFieldsFragment[];
  marketData: MarketDataFieldsFragment | null;
  assets: AssetFieldsFragment[];
  accounts?: Account[] | null;
  setCurrentMarketId: (marketId: string) => void;
}) => {
  const t = useT();

  const [topAsset, setTopAsset] = useState<AssetFieldsFragment | undefined>();
  const [bottomAsset, setBottomAsset] = useState<
    AssetFieldsFragment | undefined
  >(() => {
    if (initialAssetId) {
      return assets.find((a) => a.id === initialAssetId);
    }
  });

  const market = useSwapMarket({ markets, topAsset, bottomAsset });

  const [topAmount, setTopAmount] = useState('');
  const [bottomAmount, setBottomAmount] = useState('');
  const [tolerance, setTolerance] = useState('');

  const { pubKey, isReadOnly } = useVegaWallet();
  const create = useVegaTransactionStore((state) => state.create);

  const topAssetBalance = getAssetBalance(topAsset, accounts);
  const bottomAssetBalance = getAssetBalance(bottomAsset, accounts);

  const side = useSide({ market, bottomAsset, topAsset });

  const marketPrice = useMarketPrice({ marketData, side });
  const prevMarketPrice = usePrevious(marketPrice);

  const handleSwapAssets = () => {
    const newBaseAsset = topAsset;
    const newTopAsset = bottomAsset;
    setBottomAsset(newBaseAsset);
    setTopAsset(newTopAsset);

    setBottomAmount(topAmount);
    setTopAmount(bottomAmount);

    const market = deriveMarket({
      markets,
      topAsset: newTopAsset,
      bottomAsset: newBaseAsset,
    });
    if (market) {
      setCurrentMarketId(market.id);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check users is connected
    if (isReadOnly || !pubKey) return;
    if (!Number(topAmount)) return;
    if (!market || marketData?.marketState !== MarketState.STATE_ACTIVE) {
      return;
    }

    const side = deriveSide({ market, bottomAsset, topAsset });

    if (!side) {
      return;
    }

    const toleranceFactor = tolerance ? Number(tolerance) / 100 : 0;
    const price = derivePrice(marketData, side, toleranceFactor, market);

    const size = side === Side.SIDE_SELL ? topAmount : bottomAmount;

    const orderSubmission = {
      marketId: market.id,
      side,
      type: price ? OrderType.TYPE_LIMIT : OrderType.TYPE_MARKET,
      price: price ? price.toFixed(0) : undefined,
      timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
      size: removeDecimal(size, market.positionDecimalPlaces),
    };

    create({ orderSubmission });
  };

  useEffect(() => {
    // If we haven't derived a side we can't know how to update the amounts
    if (!side) return;

    // Avoid updating amounts if the current derived price has not changed
    if (marketPrice === prevMarketPrice) return;

    const amount = deriveAmount({
      amount: topAmount,
      marketData,
      market,
      bottomAsset,
      topAsset,
      userValue: 'top',
    });

    setBottomAmount(amount);
  }, [
    side,
    marketPrice,
    prevMarketPrice,
    bottomAsset,
    topAsset,
    topAmount,
    marketData,
    market,
    bottomAmount,
  ]);

  const sizeStep = market && determineSizeStep(market);

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
          amount={topAmount}
          onAmountChange={(e) => {
            const topAmount = e.target.value;
            const bottomAmount = deriveAmount({
              amount: topAmount,
              marketData,
              market,
              bottomAsset,
              topAsset,
              userValue: 'top',
            });
            setBottomAmount(bottomAmount);
            setTopAmount(topAmount);
          }}
          asset={topAsset}
          onAssetChange={(asset) => {
            setTopAsset(asset);
            const market = deriveMarket({
              markets,
              topAsset: asset,
              bottomAsset,
            });
            if (market) {
              setCurrentMarketId(market.id);
            }
          }}
          balance={topAssetBalance}
          assets={assets}
          testId="you-pay"
          step={side === Side.SIDE_SELL ? sizeStep : undefined}
        />
        <SwapButton onClick={handleSwapAssets} data-testid="swap-button" />
        <AssetInput
          label={t('You receive')}
          amount={bottomAmount || ''}
          asset={bottomAsset}
          balance={bottomAssetBalance}
          assets={assets}
          onAssetChange={(asset) => {
            setBottomAsset(asset);
            const market = deriveMarket({
              markets,
              topAsset,
              bottomAsset: asset,
            });
            if (market) {
              setCurrentMarketId(market.id);
            }
          }}
          onAmountChange={(e) => {
            const bottomAmount = e.target.value;
            const topAmount = deriveAmount({
              amount: bottomAmount,
              marketData,
              market,
              bottomAsset,
              topAsset,
              userValue: 'bottom',
            });
            setTopAmount(topAmount);
            setBottomAmount(bottomAmount);
          }}
          testId="you-receive"
          step={side === Side.SIDE_BUY ? sizeStep : undefined}
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
        intent={Intent.Secondary}
        data-testid="swap-now-button"
        size="large"
        disabled={
          !market || marketData?.marketState !== MarketState.STATE_ACTIVE
        }
      >
        {t('Swap now')}
      </TradingButton>
      <div className="flex flex-col gap-4">
        {!market?.id && bottomAsset && topAsset && (
          <Notification
            intent={Intent.Info}
            message={t(
              'There is no spot market for the pair, you can not swap these assets.'
            )}
          />
        )}
        {marketData && marketData.marketState !== MarketState.STATE_ACTIVE && (
          <Notification
            intent={Intent.Info}
            message={t('The market is not active, you can not swap assets.')}
          />
        )}
        <SpotData
          price={marketPrice}
          market={market}
          side={side}
          topAmount={topAmount}
          bottomAmount={bottomAmount}
          topAsset={topAsset}
          bottomAsset={bottomAsset}
        />
      </div>
    </form>
  );
};

/** Derive the amount to be received based on best bid/offer prices */
const deriveAmount = ({
  marketData,
  amount,
  market,
  bottomAsset,
  topAsset,
  userValue,
}: {
  marketData: MarketDataFieldsFragment | null;
  amount?: string;
  market?: MarketFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
  topAsset?: AssetFieldsFragment;
  userValue: 'top' | 'bottom';
}) => {
  if (!market || !amount) return '';

  const side = deriveSide({ market, bottomAsset, topAsset, userValue });

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
  bottomAsset,
  topAsset,
  userValue,
}: {
  market: MarketFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
  topAsset?: AssetFieldsFragment;
  userValue?: 'bottom' | 'top';
}) => {
  const quoteAsset = getQuoteAsset(market);
  const baseAsset = getBaseAsset(market);

  // Flip direction if deriving price when the user is editing in flipped state
  if (userValue === 'bottom') {
    if (baseAsset.id === bottomAsset?.id && quoteAsset.id === topAsset?.id) {
      return Side.SIDE_SELL;
    }

    if (baseAsset.id === topAsset?.id && quoteAsset.id === bottomAsset?.id) {
      return Side.SIDE_BUY;
    }
  }

  if (baseAsset.id === bottomAsset?.id && quoteAsset.id === topAsset?.id) {
    return Side.SIDE_BUY;
  }

  if (baseAsset.id === topAsset?.id && quoteAsset.id === bottomAsset?.id) {
    return Side.SIDE_SELL;
  }

  throw new Error(`could not derive side for swap on ${market.id}`);
};

const useSide = ({
  market,
  bottomAsset,
  topAsset,
}: {
  market?: MarketFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
  topAsset?: AssetFieldsFragment;
}) => {
  if (!market || !bottomAsset || !topAsset) return;
  return deriveSide({ market, bottomAsset, topAsset });
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

const deriveMarket = ({
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

/**
 * Return the spot market that can be used to swap the
 * two provided assets
 */
const useSwapMarket = (data: {
  markets: MarketFieldsFragment[];
  topAsset?: AssetFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
}) => {
  return deriveMarket(data);
};
