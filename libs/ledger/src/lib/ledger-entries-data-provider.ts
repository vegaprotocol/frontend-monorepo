import type { Asset } from '@vegaprotocol/assets';
import { assetsProvider } from '@vegaprotocol/assets';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type { PageInfo } from '@vegaprotocol/react-helpers';
import {
  defaultAppend as append,
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
import type {
  LedgerEntriesQuery,
  LedgerEntryFragment,
} from './__generated__/LedgerEntries';
import { LedgerEntriesDocument } from './__generated__/LedgerEntries';

export type LedgerEntry = LedgerEntryFragment & {
  id: number;
  asset: Asset | null | undefined;
  marketSender: Market | null | undefined;
  marketReceiver: Market | null | undefined;
};

const getData = (responseData: LedgerEntriesQuery): LedgerEntry[] => {
  console.log('responseData', responseData);
  return (
    responseData.ledgerEntries?.edges
      ?.filter((e) => Boolean(e?.node))
      .map((e, i) => ({ id: i, ...e?.node } as LedgerEntry)) ?? []
  );
};

const getPageInfo = (responseData: LedgerEntriesQuery): PageInfo | null =>
  responseData.ledgerEntries?.pageInfo || null;

const ledgerEntriesOnlyProvider = makeDataProvider<
  LedgerEntriesQuery,
  LedgerEntry[] | null,
  never,
  never
>({
  query: LedgerEntriesDocument,
  getData,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});

export const ledgerEntriesProvider = makeDerivedDataProvider<
  LedgerEntry[],
  never
>(
  [ledgerEntriesOnlyProvider, assetsProvider, marketsProvider],
  ([entries, assets, markets]): LedgerEntry[] =>
    entries.map((entry: LedgerEntry) => {
      const asset = assets.find((asset: Asset) => asset.id === entry.assetId);
      const marketSender = markets.find(
        (market: Market) => market.id === entry.senderMarketId
      );
      const marketReceiver = markets.find(
        (market: Market) => market.id === entry.receiverMarketId
      );
      return { ...entry, asset, marketSender, marketReceiver };
    })
);

export const useLedgerEntriesDataProvider = (partyId: string) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  return useDataProvider({
    dataProvider: ledgerEntriesProvider,
    variables,
    skip: !partyId,
  });
};
