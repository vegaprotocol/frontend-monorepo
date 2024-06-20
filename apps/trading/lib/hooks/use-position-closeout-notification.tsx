import {
  type TradeUpdateFieldsFragment,
  type TradeFieldsFragment,
  useTradesQuery,
  useTradesUpdateSubscription,
} from '@vegaprotocol/trades';
import { Side, TradeType } from '@vegaprotocol/types';
import {
  Intent,
  type Toast,
  useToasts,
  ToastHeading,
  createActiveTabKey,
} from '@vegaprotocol/ui-toolkit';
import {
  addDecimalsFormatNumber,
  removePaginationWrapper,
} from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useT } from '../use-t';
import { useMarketsMapProvider } from '@vegaprotocol/markets';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { Link } from 'react-router-dom';
import { Routes } from '../links';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import uniq from 'lodash/uniq';
import { usePositionsStore } from '../../components/positions-container';
import { PORTFOLIO_TOP_TABS } from '../../client-pages/portfolio/portfolio';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import compact from 'lodash/compact';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const createToastId = (tradeId: string) =>
  `position_close_out_notification_${tradeId}`;

type SeenCloseOutToastsStore = {
  trades: string[];
  addTrade: (tradeId: string) => void;
};
const useSeenCloseOutToastStore = create<SeenCloseOutToastsStore>()(
  persist(
    (set) => ({
      trades: [],
      addTrade: (tradeId) => {
        set((state) => {
          const trades = uniq([...state.trades, tradeId]);
          return { trades };
        });
      },
    }),
    {
      name: 'seen_close_out_positions_toasts',
    }
  )
);

const PositionClosedOutToastContent = ({
  closeOutPrice,
  asset,
  onClose,
}: {
  closeOutPrice: string;
  asset: Pick<AssetFieldsFragment, 'symbol'>;
  marketId: string;
  partyId: string;
  onClose?: () => void;
}) => {
  const t = useT();
  const [value, setValue] = useLocalStorage(
    createActiveTabKey(PORTFOLIO_TOP_TABS)
  );
  const showClosedPositions = usePositionsStore(
    (state) => state.showClosedMarkets
  );

  return (
    <>
      <ToastHeading>{t('Your position was closed.')}</ToastHeading>
      <p>
        {t(
          'You did not have enough {{assetSymbol}} to meet the margin required for your position, so it was liquidated by the network at {{price}}.',
          {
            assetSymbol: asset.symbol,
            price: closeOutPrice,
          }
        )}
      </p>
      <p>
        <Link
          className="underline"
          to={Routes.PORTFOLIO}
          onClick={() => {
            if (value !== 'positions') setValue('positions');
            if (!showClosedPositions) {
              usePositionsStore.setState({ showClosedMarkets: true });
            }
            onClose?.();
          }}
        >
          {t('See your closed positions')}
        </Link>
      </p>
    </>
  );
};

const determinePubKey = (
  trade: TradeUpdateFieldsFragment | TradeFieldsFragment
) => {
  let pubKey: string | undefined = undefined;
  switch (trade.aggressor) {
    case Side.SIDE_SELL:
      if (trade.__typename === 'Trade') pubKey = trade.buyer.id;
      if (trade.__typename === 'TradeUpdate') pubKey = trade.buyerId;
      break;
    case Side.SIDE_BUY:
      if (trade.__typename === 'Trade') pubKey = trade.seller.id;
      if (trade.__typename === 'TradeUpdate') pubKey = trade.sellerId;
      break;
    default:
    case Side.SIDE_UNSPECIFIED:
      pubKey = undefined;
      break;
  }
  return pubKey;
};

export const usePositionCloseOutNotification = () => {
  const { pubKeys } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const [seenTrades, addTrade] = useSeenCloseOutToastStore((state) => [
    state.trades,
    state.addTrade,
  ]);

  const [setToast, hasToast, updateToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
  ]);

  const onClose = (tradeId: string) => () => {
    updateToast(createToastId(tradeId), { hidden: true });
    addTrade(tradeId);
  };

  const pushNotification = (
    trade: TradeFieldsFragment | TradeUpdateFieldsFragment
  ) => {
    const marketId =
      trade.__typename === 'Trade'
        ? trade.market.id
        : trade.__typename === 'TradeUpdate'
        ? trade.marketId
        : undefined;
    if (!marketId) return;

    const market = markets?.[marketId];
    const pubKey = determinePubKey(trade);
    const toastId = createToastId(trade.id);

    if (
      !market ||
      !pubKey ||
      seenTrades.includes(trade.id) ||
      hasToast(toastId)
    ) {
      return;
    }

    const closeOutPrice = addDecimalsFormatNumber(
      trade.price,
      market.decimalPlaces
    );

    let asset: Pick<AssetFieldsFragment, 'symbol'> | undefined = undefined;
    if (
      market.tradableInstrument.instrument.product.__typename === 'Future' ||
      market.tradableInstrument.instrument.product.__typename === 'Perpetual'
    ) {
      asset = market.tradableInstrument.instrument.product.settlementAsset;
    } else if (
      market.tradableInstrument.instrument.product.__typename === 'Spot'
    ) {
      asset = market.tradableInstrument.instrument.product.quoteAsset;
    }

    if (!asset) return;

    const toast: Toast = {
      id: createToastId(trade.id),
      intent: Intent.Warning,
      onClose: onClose(trade.id),
      content: (
        <PositionClosedOutToastContent
          closeOutPrice={closeOutPrice}
          asset={asset}
          marketId={market.id}
          partyId={pubKey}
          onClose={onClose(trade.id)}
        />
      ),
    };
    setToast(toast);
  };

  useTradesQuery({
    variables: {
      partyIds: [...pubKeys.map((k) => k.publicKey)],
    },
    skip: pubKeys.length === 0,
    onCompleted: (data) => {
      const tradesByMarket = groupBy(
        orderBy(
          removePaginationWrapper(data.trades?.edges),
          (trade) => trade.createdAt,
          'desc'
        )
          .map((trade) => {
            return { ...trade, pubKey: determinePubKey(trade) };
          })
          .filter(
            (trade) =>
              trade.pubKey &&
              pubKeys.map((pk) => pk.publicKey).includes(trade.pubKey)
          ),
        (trade) => {
          return `${trade.market.id}-${trade.pubKey}`;
        }
      );

      for (const trades of Object.values(tradesByMarket)) {
        if (
          trades.length > 0 &&
          trades[0].type === TradeType.TYPE_NETWORK_CLOSE_OUT_BAD
        ) {
          pushNotification(trades[0]);
        }
      }
    },
  });

  useTradesUpdateSubscription({
    variables: {
      partyIds: [...pubKeys.map((k) => k.publicKey)],
    },
    skip: pubKeys.length === 0,
    onData: (options) => {
      const updates = compact(options.data.data?.tradesStream);
      for (const update of updates) {
        const pubKey = determinePubKey(update);
        if (
          pubKey &&
          pubKeys.map((pk) => pk.publicKey).includes(pubKey) &&
          update.type === TradeType.TYPE_NETWORK_CLOSE_OUT_BAD
        ) {
          pushNotification(update);
        }
      }
    },
  });
};
