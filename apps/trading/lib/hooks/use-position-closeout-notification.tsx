import { useApolloClient } from '@apollo/client';
import {
  PositionsDocument,
  type PositionsQuery,
  type PositionsQueryVariables,
} from '@vegaprotocol/positions';
import {
  TradesDocument,
  TradesUpdateDocument,
  type TradeUpdateFieldsFragment,
  type TradesUpdateSubscription,
  type TradesQuery,
  type TradesQueryVariables,
  type TradesUpdateSubscriptionVariables,
  type TradeFieldsFragment,
} from '@vegaprotocol/trades';
import { Side, TradeType } from '@vegaprotocol/types';
import {
  Intent,
  type Toast,
  useToasts,
  ToastHeading,
  createActiveTabKey,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '../use-t';
import { useMarketsMapProvider } from '@vegaprotocol/markets';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { Link } from 'react-router-dom';
import { Routes } from '../links';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import uniq from 'lodash/uniq';

import { usePositionsStore } from '../../components/positions-container';
import { PORTFOLIO_TOP_TABS } from '../../client-pages/portfolio/portfolio';
import { theme } from '@vegaprotocol/tailwindcss-config';

const LOCAL_STORAGE_KEY = 'vega_position_close_out_notifications';

const createToastId = (tradeId: string) =>
  `position_close_out_notification_${tradeId}`;

const parseLocalStorageValue = (value: string | null | undefined): string[] => {
  try {
    if (value) {
      const json = JSON.parse(value);
      if (Array.isArray(json)) {
        return json.filter((v) => v.match(/^[0-9a-f]{64}$/));
      }
    }
  } catch {
    // NOOP
  }
  return [];
};

const useSeen = () => {
  const [localStorageValue, setLocalStorageValue] =
    useLocalStorage(LOCAL_STORAGE_KEY);
  const seen = parseLocalStorageValue(localStorageValue);
  const setSeen = useCallback(
    (tradeId: string) => {
      const newSeen = uniq([...(seen || []), tradeId]);
      setLocalStorageValue(JSON.stringify(newSeen));
    },
    [seen, setLocalStorageValue]
  );

  return { seen, setSeen };
};

const PositionClosedOutToastContent = ({
  closeOutPrice,
  asset,
  marketId,
  partyId,
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

  const highlightPositionElement = () => {
    let tries = 0;
    const int = setInterval(() => {
      tries += 1;
      if (tries > 10) {
        clearInterval(int);
      }
      const position = document.querySelector(
        `[data-position][data-market-id="${marketId}"][data-party-id="${partyId}"]`
      );
      if (position) {
        const agGridPinnedRow =
          position.parentElement?.parentElement?.parentElement?.parentElement;
        if (agGridPinnedRow) {
          agGridPinnedRow.style.background = theme.colors.vega.yellow[500];
          agGridPinnedRow.style.transition = 'all 50ms ease-in-out';
          setTimeout(() => {
            agGridPinnedRow.style.background = '';
            setTimeout(() => {
              agGridPinnedRow.style.transition = '';
            }, 200);
          }, 200);
        }
        clearInterval(int);
      }
    }, 200);
  };

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
            highlightPositionElement();
            onClose?.();
          }}
        >
          {t('See your closed positions')}
        </Link>
      </p>
    </>
  );
};

export const usePositionCloseOutNotification = () => {
  const client = useApolloClient();
  const { pubKeys } = useVegaWallet();
  const { data: markets } = useMarketsMapProvider();
  const { seen, setSeen } = useSeen();

  const [setToast, hasToast, updateToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
  ]);

  const onClose = useCallback(
    (tradeId: string) => () => {
      // hides toast instead of removing is so it won't be re-added on rerender
      updateToast(createToastId(tradeId), { hidden: true });
      setSeen(tradeId);
    },
    [setSeen, updateToast]
  );

  const [errorCount, setErrorCount] = useState(0);

  const onRejection = useCallback(
    () => setErrorCount((errorCount) => errorCount + 1),
    [setErrorCount]
  );

  const pushNotification = useCallback(
    (trade: TradeFieldsFragment | TradeUpdateFieldsFragment) => {
      const marketId =
        trade.__typename === 'Trade'
          ? trade.market.id
          : trade.__typename === 'TradeUpdate'
          ? trade.marketId
          : undefined;
      if (!marketId) return;

      const market = markets?.[marketId];

      // The pubKey associated with closed out position
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

      const toastId = createToastId(trade.id);

      if (!market || !pubKey || seen.includes(trade.id) || hasToast(toastId)) {
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
    },
    [hasToast, markets, onClose, seen, setToast]
  );

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined = undefined;
    let ignore = false;

    if (!pubKeys) {
      return;
    }

    const runQueries = () => {
      if (ignore) return;

      // 1. listen for trades (for all connected pub keys)
      // 2. notify if a trade is TYPE_NETWORK_CLOSE_OUT_BAD
      subscription = client
        .subscribe<TradesUpdateSubscription, TradesUpdateSubscriptionVariables>(
          {
            query: TradesUpdateDocument,
            variables: {
              partyIds: [...pubKeys.map((k) => k.publicKey)],
            },
            fetchPolicy: 'no-cache',
          }
        )
        .subscribe(({ data }) => {
          data?.tradesStream?.forEach((trade) => {
            if (trade.type === TradeType.TYPE_NETWORK_CLOSE_OUT_BAD) {
              pushNotification(trade);
            }
          });
        }, onRejection);

      // 1. get positions
      // 2. get latest trades for positions
      // 3. notify if a trade is TYPE_NETWORK_CLOSE_OUT_BAD
      client
        .query<PositionsQuery, PositionsQueryVariables>({
          query: PositionsDocument,
          variables: { partyIds: [...pubKeys.map((k) => k.publicKey)] },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          data.positions?.edges?.forEach(({ node: position }) => {
            client
              .query<TradesQuery, TradesQueryVariables>({
                query: TradesDocument,
                variables: {
                  marketIds: [position.market.id],
                  partyIds: [position.party.id],
                  pagination: { first: 1 },
                },
                fetchPolicy: 'no-cache',
              })
              .then(({ data }) => {
                const trade = data.trades?.edges?.[0]?.node;
                if (
                  trade &&
                  trade.type === TradeType.TYPE_NETWORK_CLOSE_OUT_BAD
                ) {
                  pushNotification(trade);
                }
              }, onRejection);
          });
        });
    };
    runQueries();

    return () => {
      if (subscription) subscription.unsubscribe();
      ignore = true;
    };
  }, [pubKeys, client, pushNotification, onRejection, errorCount]);
};
