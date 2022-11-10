import type { Asset } from '@vegaprotocol/assets';
import { assetsProvider } from '@vegaprotocol/assets';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import {
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
  market: Market | null | undefined;
};

const getData = (responseData: LedgerEntriesQuery): LedgerEntry[] =>
  responseData.ledgerEntries?.edges
    ?.filter((e) => Boolean(e?.node))
    .map((e, i) => ({ id: i, ...e?.node } as LedgerEntry)) ?? [];

const ledgerEntriesOnlyProvider = makeDataProvider<
  LedgerEntriesQuery,
  LedgerEntry[] | null,
  never,
  never
>({ query: LedgerEntriesDocument, getData });

export const ledgerEntriesProvider = makeDerivedDataProvider<
  LedgerEntry[],
  never
>(
  [ledgerEntriesOnlyProvider, assetsProvider, marketsProvider],
  ([entries, assets, markets]): LedgerEntry[] =>
    entries.map((entry: LedgerEntry) => {
      const asset = assets.find((asset: Asset) => asset.id === entry.assetId);
      const market = markets.find(
        (market: Market) => market.id === entry.marketId
      );
      return { ...entry, asset, market };
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
