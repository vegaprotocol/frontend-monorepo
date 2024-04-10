import { URL_BASE, DEFAULT_VEGA_CHAIN } from '../config';
import { EmblemBase } from './emblem-base';
import { useMarketInfo } from './hooks/use-market-info';

export type EmblemByMarketProps = {
  market: string;
  vegaChain?: string;
  contract?: never;
  asset?: never;
};

/**
 * Given a Vega Market ID...
 *
 * @param market string the market ID
 * @param vegaChain string the vega chain ID (default: Vega Mainnet)
 * @returns React.Node
 */
export function EmblemByMarket(p: EmblemByMarketProps) {
  const chain = p.vegaChain ? p.vegaChain : DEFAULT_VEGA_CHAIN;
  const data = useMarketInfo(chain, p.market);

  const base = data.data?.baseLogo
    ? `${URL_BASE}${data.data.baseLogo}`
    : `${URL_BASE}/missing.svg`;
  const quote = data.data?.quoteLogo
    ? `${URL_BASE}${data.data.quoteLogo}`
    : `${URL_BASE}/missing.svg`;

  return (
    <span className="mr-2">
      <EmblemBase
        src={base}
        className="inline-block w-5 h-5 z-10 relative rounded-full bg-white"
        {...p}
      />
      <EmblemBase
        src={quote}
        className="inline-block w-5 h-5 rounded-full ml-[-8px]"
        {...p}
      />
    </span>
  );
}
