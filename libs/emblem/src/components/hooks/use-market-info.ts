import { useEffect, useState } from 'react';
import { URL_BASE } from '../../config';

export type MarketInfo = {
  quoteLogo: string;
  settlementLogo?: string;
  baseLogo: string;
};

export type MarketInfoState = {
  loading: boolean;
  data?: MarketInfo | null;
  error: Error | null | undefined;
};

export async function fetchMarketInfo(path: string) {
  return (await fetch(path)).json();
}

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
