import { DATA_SOURCES } from '../config';

type IGetTxsDataPrevious = {
  count?: number;
  before: string;
  filters?: string;
  party?: string;
};

type IGetTxsDataNext = {
  count?: number;
  after: string;
  filters?: string;
  party?: string;
};

type IGetTxsDataFirstPage = {
  count?: number;
  party?: string;
  filters?: string;
};

type IGetTxsDataUrl =
  | IGetTxsDataPrevious
  | IGetTxsDataNext
  | IGetTxsDataFirstPage;

export const BE_TXS_PER_REQUEST = 25;

/**
 * Properly encodes the filters and parameters for a request to the block explorer
 * API for transactions. As the API uses a slightly less common format for encoding
 * filters, some of it is more manual than you might expect.
 *
 * @param params An object containing the pagination and filters
 * @returns string URL to call
 */
export const getTxsDataUrl = (params: IGetTxsDataUrl) => {
  const url = new URL(`${DATA_SOURCES.blockExplorerUrl}/transactions`);
  const count = `${params.count || BE_TXS_PER_REQUEST}`;

  if ('before' in params) {
    url.searchParams.append('last', count);
    url.searchParams.append('before', params.before);
  } else if ('after' in params) {
    url.searchParams.append('first', count);
    url.searchParams.append('after', params.after);
  } else {
    url.searchParams.append('first', count);
  }

  // Hacky fix for param as array
  let urlAsString = url.toString();
  if ('filters' in params && typeof params.filters === 'string') {
    urlAsString += '&' + params.filters.replace(' ', '%20');
  }
  if ('party' in params) {
    urlAsString += `&filters[tx.submitter]=${params.party}`;
  }

  return urlAsString;
};
