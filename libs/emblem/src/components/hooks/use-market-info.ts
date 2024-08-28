import { URL_BASE } from '../../config';
import { useQuery } from '@tanstack/react-query';

// This is a subset of the fields available in the JSON, but these
// are the only fields required by the Emblem components
type MarketInfo = {
  // Full path to the logo for the quote asset
  quoteLogo: string;
  // Full path to the logo for the settlement asset
  quoteChainLogo: string;
  // Full path to the logo for the settlement asset
  settlementLogo?: string;
  // Chain logo
  settlementChainLogo?: string;
  // Full path to the logo for the base asset
  baseLogo: string;
  // Full path to the logo for the chain
  baseChainLogo?: string;
};

/**
 * Fetch and parse the market info file
 *
 * @param URL for the market info file
 * @returns Promise<MarketInfo>
 */
export async function fetchMarketInfo(path: string) {
  return (await fetch(path)).json() as Promise<MarketInfo>;
}

/**
 * Hook to fetch the information JSON for a specific market. There is a
 * single file that contains the base, quote and settlement logos for all
 * markets
 *
 * @param vegaChain string representing the vega chain (e.g. 'vega-testnet-1')
 * @param marketId string Market ID
 * @returns MarketInfoState
 */
export const useMarketInfo = (vegaChain: string, marketId: string) => {
  const queryResult = useQuery({
    queryKey: ['emblem', vegaChain, marketId],
    queryFn: ({ queryKey }) => {
      const [, vegaChain, marketId] = queryKey;
      return fetchMarketInfo(
        `${URL_BASE}/vega/${vegaChain}/market/${marketId}/index.json`
      );
    },
  });

  return queryResult;
};
