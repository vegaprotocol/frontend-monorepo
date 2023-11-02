import { DATA_SOURCES } from '../config';

type IGetTxsDataFirstPage = {
  baseUrl?: string;
  count?: number;
  party?: string;
  filters?: string;
};

interface IGetTxsDataPrevious extends IGetTxsDataFirstPage {
  before: string;
}

interface IGetTxsDataNext extends IGetTxsDataFirstPage {
  after: string;
}

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
  const baseUrl =
    params.baseUrl || `${DATA_SOURCES.blockExplorerUrl}/transactions`;
  const url = new URL(baseUrl);
  const count = `${params.count || BE_TXS_PER_REQUEST}`;

  if ('before' in params && params.before?.length > 0) {
    url.searchParams.append('last', count);
    url.searchParams.append('before', params.before);
  } else if ('after' in params && params.after?.length > 0) {
    url.searchParams.append('first', count);
    url.searchParams.append('after', params.after);
  } else {
    url.searchParams.append('last', count);
  }

  // Hacky fix for param as array
  let urlAsString = url.toString();
  if (params.filters && params.filters?.length > 0) {
    urlAsString += '&' + params.filters.replaceAll(' ', '%20');
  }
  if (params.party && params.party?.length > 0) {
    urlAsString += `&filters[tx.submitter]=${params.party}`;
  }

  return urlAsString;
};
