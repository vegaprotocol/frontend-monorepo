import type { Asset } from '@vegaprotocol/assets';
import { assetsMapProvider } from '@vegaprotocol/assets';
import type { Market } from '@vegaprotocol/markets';
import { marketsMapProvider } from '@vegaprotocol/markets';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/data-provider';

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

type Edge = LedgerEntriesQuery['ledgerEntries']['edges'][number];

const isLedgerEntryEdge = (entry: Edge): entry is NonNullable<Edge> =>
  entry !== null;

const getData = (responseData: LedgerEntriesQuery | null) => {
  return (
    responseData?.ledgerEntries?.edges
      .filter(isLedgerEntryEdge)
      .map((edge) => edge.node) || []
  );
};

const ledgerEntriesOnlyProvider = makeDataProvider<
  LedgerEntriesQuery,
  ReturnType<typeof getData>,
  never,
  never,
  LedgerEntriesQueryVariables
>({
  query: LedgerEntriesDocument,
  getData,
  additionalContext: {
    isEnlargedTimeout: true,
  },
});

export const ledgerEntriesProvider = makeDerivedDataProvider<
  LedgerEntry[],
  never,
  LedgerEntriesQueryVariables
>(
  [
    ledgerEntriesOnlyProvider,
    (callback, client) => assetsMapProvider(callback, client, undefined),
    (callback, client) => marketsMapProvider(callback, client, undefined),
  ],
  (partsData) => {
    const entries = partsData[0] as ReturnType<typeof getData>;
    const assets = partsData[1] as Record<string, Asset>;
    const markets = partsData[1] as Record<string, Market>;
    return entries.map((entry) => {
      const asset = entry.assetId
        ? (assets as Record<string, Asset>)[entry.assetId]
        : null;
      const marketSender = entry.fromAccountMarketId
        ? markets[entry.fromAccountMarketId]
        : null;
      const marketReceiver = entry.toAccountMarketId
        ? markets[entry.toAccountMarketId]
        : null;
      return { ...entry, asset, marketSender, marketReceiver };
    });
  }
);
