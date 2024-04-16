import { URL_BASE } from '../config';
import { EmblemBase } from './emblem-base';
import { useMarketInfo } from './hooks/use-market-info';
import { getVegaChain } from './lib/get-chain';

export type EmblemByMarketProps = {
  market: string;
  vegaChain?: string;
  showBase?: boolean;
  showQuote?: boolean;
  contract?: never;
  asset?: never;
  wrapperClass?: string;
};

/**
 * Given a Vega Market ID...
 *
 * @param market string the market ID
 * @param vegaChain string the vega chain ID (default: Vega Mainnet)
 * @returns React.Node
 */
export function EmblemByMarket(props: EmblemByMarketProps) {
  const chain = getVegaChain(props.vegaChain);
  const data = useMarketInfo(chain, props.market);
  const showBase = props.showBase ?? true;
  const showQuote = props.showQuote ?? true;
  const wrapperClass = props.wrapperClass ?? 'mr-2';

  const base = data.data?.baseLogo
    ? `${URL_BASE}${data.data.baseLogo}`
    : `${URL_BASE}/missing.svg`;
  const quote = data.data?.quoteLogo
    ? `${URL_BASE}${data.data.quoteLogo}`
    : `${URL_BASE}/missing.svg`;

  return (
    <span className={wrapperClass}>
      {showBase && (
        <EmblemBase
          src={base}
          className="inline-block w-5 h-5 z-10 relative rounded-full bg-white"
          {...props}
        />
      )}
      {showQuote && (
        <EmblemBase
          src={quote}
          className={`inline-block w-5 h-5 rounded-full ${
            showBase ? 'ml-[-8px]' : ''
          }`}
          {...props}
        />
      )}
    </span>
  );
}
