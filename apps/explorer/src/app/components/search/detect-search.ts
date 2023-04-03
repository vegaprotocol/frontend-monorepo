import { remove0x } from '@vegaprotocol/utils';
import { DATA_SOURCES } from '../../config';
import type { BlockExplorerTransaction } from '../../routes/types/block-explorer-response';

export enum SearchTypes {
  Transaction = 'transaction',
  Party = 'party',
  Block = 'block',
  Order = 'order',
  Unknown = 'unknown',
}

export const HASH_LENGTH = 64;

export const isHash = (value: string) =>
  /[0-9a-fA-F]+/.test(remove0x(value)) &&
  remove0x(value).length === HASH_LENGTH;

export const isHexadecimal = (search: string) =>
  search.startsWith('0x') && search.length === 2 + HASH_LENGTH;

export const isNonHex = (search: string) =>
  !search.startsWith('0x') && search.length === HASH_LENGTH;

export const isBlock = (search: string) => !Number.isNaN(Number(search));

export const isNetworkParty = (search: string) => search === 'network';

export const toHex = (query: string) =>
  isHexadecimal(query) ? query : `0x${query}`;

export const toNonHex = remove0x;

/**
 * Determine the type of the given query
 */
export const determineType = async (query: string): Promise<SearchTypes> => {
  const value = query.toLowerCase();
  if (isHash(value)) {
    // it can be either `SearchTypes.Party` or `SearchTypes.Transaction`
    if (await isTransactionHash(value)) {
      return SearchTypes.Transaction;
    } else {
      return SearchTypes.Party;
    }
  } else if (isNetworkParty(value)) {
    return SearchTypes.Party;
  } else if (isBlock(value)) {
    return SearchTypes.Block;
  }
  return SearchTypes.Unknown;
};

/**
 * Checks if given input is a transaction hash by querying the transactions
 * endpoint
 */
export const isTransactionHash = async (input: string): Promise<boolean> => {
  const hash = remove0x(input);
  const request = await fetch(
    `${DATA_SOURCES.blockExplorerUrl}/transactions/${hash}`
  );

  if (request?.ok) {
    const body: BlockExplorerTransaction = await request.json();
    if (body?.transaction) {
      return true;
    }
  }

  return false;
};
