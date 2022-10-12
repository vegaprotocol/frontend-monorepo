import { DATA_SOURCES } from '../../config';
import type { BlockExplorerTransaction } from '../../routes/types/block-explorer-response';

export enum SearchTypes {
  Transaction = 'transaction',
  Party = 'party',
  Block = 'block',
  Order = 'order',
}

export const TX_LENGTH = 64;

export const isHexadecimal = (search: string) =>
  search.startsWith('0x') && search.length === 2 + TX_LENGTH;

export const isNonHex = (search: string) =>
  !search.startsWith('0x') && search.length === TX_LENGTH;

export const isBlock = (search: string) => !Number.isNaN(Number(search));

export const isNetworkParty = (search: string) => search === 'network';

export const toHex = (query: string) =>
  isHexadecimal(query) ? query : `0x${query}`;

export const toNonHex = (query: string) =>
  isNonHex(query) ? query : `${query.replace('0x', '')}`;

export const detectTypeFromQuery = (
  query: string
): SearchTypes[] | undefined => {
  const i = query.toLowerCase();

  if (isHexadecimal(i) || isNonHex(i)) {
    return [SearchTypes.Party, SearchTypes.Transaction];
  } else if (isNetworkParty(i)) {
    return [SearchTypes.Party];
  } else if (isBlock(i)) {
    return [SearchTypes.Block];
  }

  return undefined;
};

export const detectTypeByFetching = async (
  query: string
): Promise<SearchTypes | undefined> => {
  const hash = toNonHex(query);
  const request = await fetch(
    `${DATA_SOURCES.blockExplorerUrl}/transactions/${hash}`
  );

  if (request?.ok) {
    const body: BlockExplorerTransaction = await request.json();

    if (body?.transaction) {
      return SearchTypes.Transaction;
    }
  }

  return SearchTypes.Party;
};

// Code commented out because the current solution to detect a hex is temporary (by process of elimination)
// export const detectTypeByFetching = async (
//   query: string,
//   type: SearchTypes
// ): Promise<SearchTypes | undefined> => {
//   const TYPES = [SearchTypes.Party, SearchTypes.Transaction];
//
//   if (!TYPES.includes(type)) {
//     throw new Error('Search type provided not recognised');
//   }
//
//   if (type === SearchTypes.Transaction) {
//     const hash = toNonHex(query);
//     const request = await fetch(
//       `${DATA_SOURCES.blockExplorerUrl}/transactions/${hash}`
//     );
//
//     if (request?.ok) {
//       const body: BlockExplorerTransaction = await request.json();
//
//       if (body?.transaction) {
//         return SearchTypes.Transaction;
//       }
//     }
//   } else if (type === SearchTypes.Party) {
//     const party = toNonHex(query);
//
//     const request = await fetch(
//       `${DATA_SOURCES.blockExplorerUrl}/transactions?limit=1&filters[tx.submitter]=${party}`
//     );
//
//     if (request.ok) {
//       const body: BlockExplorerTransactions = await request.json();
//
//       if (body?.transactions?.length) {
//         return SearchTypes.Party;
//       }
//     }
//   }
//
//   return undefined;
// };

// export const getSearchType = async (
//   query: string
// ): Promise<SearchTypes | undefined> => {
//   const searchTypes = detectTypeFromQuery(query);
//   const hasResults = searchTypes?.length;
//
//   if (hasResults) {
//     if (hasResults > 1) {
//       const promises = searchTypes.map((type) =>
//         detectTypeByFetching(query, type)
//       );
//       const results = await Promise.all(promises);
//       return results.find((result) => result !== undefined);
//     }
//
//     return searchTypes[0];
//   }
//
//   return undefined;
// };

export const getSearchType = async (
  query: string
): Promise<SearchTypes | undefined> => {
  const searchTypes = detectTypeFromQuery(query);
  const hasResults = searchTypes?.length;

  if (hasResults) {
    if (hasResults > 1) {
      return await detectTypeByFetching(query);
    }

    return searchTypes[0];
  }

  return undefined;
};
