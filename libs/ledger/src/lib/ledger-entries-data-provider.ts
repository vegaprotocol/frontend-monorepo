import type { Asset } from '@vegaprotocol/assets';
import { assetsProvider } from '@vegaprotocol/assets';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import { makeInfiniteScrollGetRows } from '@vegaprotocol/utils';
import { updateGridData } from '@vegaprotocol/react-helpers';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import type * as Schema from '@vegaprotocol/types';
import type { AgGridReact } from 'ag-grid-react';
import produce from 'immer';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';
import type { RefObject } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import type { Filter } from './ledger-manager';
import type {
  LedgerEntriesQuery,
  LedgerEntriesQueryVariables,
  LedgerEntryFragment,
} from './__generated__/LedgerEntries';
import { LedgerEntriesDocument } from './__generated__/LedgerEntries';

export type LedgerEntry = LedgerEntryFragment & {
  asset: Asset | null | undefined;
  marketSender: Market | null | undefined;
  marketReceiver: Market | null | undefined;
};

export type AggregatedLedgerEntriesEdge = Schema.AggregatedLedgerEntriesEdge;
export type AggregatedLedgerEntriesNode = Omit<
  AggregatedLedgerEntriesEdge,
  'node'
> & {
  node: LedgerEntry;
};

const getData = (responseData: LedgerEntriesQuery | null) => {
  return responseData?.ledgerEntries?.edges || [];
};

export const update = (
  data: ReturnType<typeof getData> | null,
  delta: ReturnType<typeof getData>,
  reload: () => void,
  variables: LedgerEntriesQueryVariables
) => {
  if (!data) {
    return data;
  }
  return produce(data, (draft) => {
    // A single update can contain the same order with multiple updates, so we need to find
    // the latest version of the order and only update using that
    const incoming = uniqBy(
      orderBy(delta, (entry) => entry?.node.vegaTime, 'desc'),
      'id'
    );

    // Add or update incoming orders
    incoming.reverse().forEach((node) => {
      const index = draft.findIndex(
        (edge) => edge?.node.vegaTime === node?.node.vegaTime
      );
      const newer =
        draft.length === 0 || node?.node.vegaTime >= draft[0]?.node.vegaTime;
      let doesFilterPass = true;
      if (
        doesFilterPass &&
        variables?.dateRange?.start &&
        new Date(node?.node.vegaTime) <= new Date(variables?.dateRange?.start)
      ) {
        doesFilterPass = false;
      }
      if (
        doesFilterPass &&
        variables?.dateRange?.end &&
        new Date(node?.node.vegaTime) >= new Date(variables?.dateRange?.end)
      ) {
        doesFilterPass = false;
      }
      if (index !== -1) {
        if (doesFilterPass) {
          // Object.assign(draft[index]?.node, node?.node);
          if (newer) {
            draft.unshift(...draft.splice(index, 1));
          }
        } else {
          draft.splice(index, 1);
        }
      } else if (newer && doesFilterPass) {
        draft.unshift(node);
      }
    });
  });
};

const ledgerEntriesOnlyProvider = makeDataProvider({
  query: LedgerEntriesDocument,
  getData,
  getDelta: getData,
  update,
  additionalContext: {
    isEnlargedTimeout: true,
  },
});

export const ledgerEntriesProvider = makeDerivedDataProvider<
  AggregatedLedgerEntriesNode[],
  AggregatedLedgerEntriesNode[],
  LedgerEntriesQueryVariables
>(
  [
    ledgerEntriesOnlyProvider,
    (callback, client) => assetsProvider(callback, client, undefined),
    (callback, client) => marketsProvider(callback, client, undefined),
  ],
  ([entries, assets, markets]) => {
    return entries.map((edge: AggregatedLedgerEntriesEdge) => {
      const entry = edge.node;
      const asset = assets.find((asset: Asset) => asset.id === entry.assetId);
      const marketSender = markets.find(
        (market: Market) => market.id === entry.fromAccountMarketId
      );
      const marketReceiver = markets.find(
        (market: Market) => market.id === entry.toAccountMarketId
      );
      const cursor = edge?.cursor;
      return {
        node: { ...entry, asset, marketSender, marketReceiver },
        cursor,
      };
    });
  }
);

interface Props {
  partyId: string;
  filter?: Filter;
  gridRef: RefObject<AgGridReact>;
}

export const useLedgerEntriesDataProvider = ({
  partyId,
  filter,
  gridRef,
}: Props) => {
  const dataRef = useRef<AggregatedLedgerEntriesEdge[] | null>(null);
  const totalCountRef = useRef<number>();

  const variables = useMemo<LedgerEntriesQueryVariables>(
    () => ({
      partyId,
      dateRange: filter?.vegaTime?.value,
      pagination: {
        first: 5000,
      },
    }),
    [partyId, filter?.vegaTime?.value]
  );

  const update = useCallback(
    ({ data }: { data: AggregatedLedgerEntriesEdge[] | null }) => {
      return updateGridData(dataRef, data, gridRef);
    },
    [gridRef]
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: AggregatedLedgerEntriesEdge[] | null;
      totalCount?: number;
    }) => {
      totalCountRef.current = totalCount;
      return updateGridData(dataRef, data, gridRef);
    },
    [gridRef]
  );

  const { data, error, loading, load, totalCount, reload } = useDataProvider({
    dataProvider: ledgerEntriesProvider,
    update,
    insert,
    variables,
    skip: !variables.partyId,
  });
  totalCountRef.current = totalCount;

  const getRows = makeInfiniteScrollGetRows<AggregatedLedgerEntriesEdge>(
    dataRef,
    totalCountRef,
    load
  );
  return { loading, error, data, getRows, reload };
};
