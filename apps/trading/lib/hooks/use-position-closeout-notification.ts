import { useApolloClient } from '@apollo/client';
import {
  PositionsDocument,
  type PositionsQuery,
  type PositionsQueryVariables,
} from '@vegaprotocol/positions';
import {
  TradesDocument,
  TradesUpdateDocument,
  type TradesUpdateSubscription,
  type TradesQuery,
  type TradesQueryVariables,
  type TradesUpdateSubscriptionVariables,
} from '@vegaprotocol/trades';
import { TradeType } from '@vegaprotocol/types';
import { LocalStorage } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useCallback, useEffect, useState } from 'react';

const LOCAL_STORAGE_KEY = 'vega_position_close_out_notification';

const storedPushedNotification: string[] | undefined = undefined;

const readStoredPushedNotification = () => {
  if (storedPushedNotification) {
    return storedPushedNotification;
  }
  let value: string[] = [];
  const rawValue = LocalStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawValue) {
    try {
      const parsedValue = JSON.parse(rawValue);
      if (Array.isArray(parsedValue)) {
        value = parsedValue.filter((v) =>
          v.match(/^[0-9a-f]{64}:[0-9a-f]{64}:[0-9a-f]{64}$/)
        );
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
  return value;
};

const writePushedNotification = (value: string[]) => {
  LocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
};

const createStoredPushedNotificationId = (
  partyId: string,
  marketId: string,
  tradeId?: string
) => `${partyId}:${marketId}:${tradeId}`;

const hasStoredPushedNotification = (
  partyId: string,
  marketId: string,
  tradeId?: string
) =>
  tradeId
    ? readStoredPushedNotification().indexOf(
        createStoredPushedNotificationId(partyId, marketId, tradeId)
      ) !== -1
    : readStoredPushedNotification().some((v) =>
        v.startsWith(createStoredPushedNotificationId(partyId, marketId))
      );

const removeStoredPushedNotification = (partyId: string, marketId: string) =>
  writePushedNotification(
    readStoredPushedNotification().filter(
      (v) => !v.startsWith(`${partyId}:${marketId}`)
    )
  );

const addStoredPushedNotification = (
  partyId: string,
  marketId: string,
  tradeId: string
) => {
  const remove = createStoredPushedNotificationId(partyId, marketId);
  const add = createStoredPushedNotificationId(partyId, marketId, tradeId);
  writePushedNotification(
    readStoredPushedNotification()
      .filter((v) => !v.startsWith(remove))
      .concat(add)
  );
};

export const usePositionCloseoutNotification = () => {
  const client = useApolloClient();
  const { pubKey } = useVegaWallet();
  const [errorCount, setErrorCount] = useState(0);
  const onRejection = useCallback(
    () => setErrorCount((errorCount) => errorCount + 1),
    [setErrorCount]
  );
  const pushNotification = useCallback(
    (marketId: string, tradeId: string) => {
      if (!pubKey || hasStoredPushedNotification(pubKey, marketId, tradeId)) {
        return;
      }
      addStoredPushedNotification(pubKey, marketId, tradeId);
      // eslint-disable-next-line no-console
      console.log('clouseout notification', { pubKey, marketId, tradeId });
      // @TODO push notification to toast store
    },
    [pubKey]
  );
  useEffect(() => {
    if (!pubKey) {
      return;
    }
    const subscription = client
      .subscribe<TradesUpdateSubscription, TradesUpdateSubscriptionVariables>({
        query: TradesUpdateDocument,
        variables: {
          partyIds: [pubKey],
        },
        fetchPolicy: 'no-cache',
      })
      .subscribe(({ data }) => {
        data?.tradesStream?.forEach((trade) => {
          if (trade.type === TradeType.TYPE_NETWORK_CLOSE_OUT_BAD) {
            pushNotification(trade.marketId, trade.id);
          }
        });
      }, onRejection);
    client
      .query<PositionsQuery, PositionsQueryVariables>({
        query: PositionsDocument,
        variables: { partyIds: [pubKey] },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        data.positions?.edges?.forEach(({ node: position }) => {
          client
            .query<TradesQuery, TradesQueryVariables>({
              query: TradesDocument,
              variables: {
                marketIds: [position.market.id],
                partyIds: [pubKey],
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
                pushNotification(trade.market.id, trade.id);
              } else {
                removeStoredPushedNotification(pubKey, position.market.id);
              }
            }, onRejection);
        });
      });
    return subscription.unsubscribe;
  }, [pubKey, client, pushNotification, onRejection, errorCount]);
};
