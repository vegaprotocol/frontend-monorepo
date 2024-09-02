import { useEffect, useState } from 'react';
import { URL_BASE } from '../../config';

// This is a subset of the fields available in the JSON, but these
// are the only fields required by the Emblem components
export type MarketInfo = {
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

export type MarketInfoState = {
  loading: boolean;
  data?: MarketInfo | null;
  error: Error | null | undefined;
};

/**
 * Fetch and parse the market info file
 *
 * @param URL for the market info file
 * @returns Promise<MarketInfo>
 */
export async function fetchMarketInfo(path: string) {
  return (await fetch(path)).json();
}

/**
 * Hook to fetch the information JSON for a specific market. There is a
 * single file that contains the base, quote and settlement logos for all
 * markets, so this hook could be adapted to fetch that once and parse
 * out the relevant market info. This has not been done yet, nor has caching
 * been done in the hook, as the headers set by icon.vega.xyz will ensure
 * that the response is cached, which is sufficient for now.
 *
 * @param vegaChain string representing the vega chain (e.g. 'vega-testnet-1')
 * @param marketId string Market ID
 * @returns MarketInfoState
 */
export const useMarketInfo = (vegaChain: string, marketId: string) => {
  const [state, setState] = useState<MarketInfoState>({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const path = `${URL_BASE}/vega/${vegaChain}/market/${marketId}/index.json`;

    fetchMarketInfo(path)
      .then((market) => {
        if (mounted) {
          setState({
            loading: false,
            data: market,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (mounted) {
          setState({
            loading: false,
            data: null,
            error: err,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [vegaChain, marketId]);

  return state;
};
