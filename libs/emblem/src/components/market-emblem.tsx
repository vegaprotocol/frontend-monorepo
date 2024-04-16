import { URL_BASE } from '../config';
import { EmblemBase } from './emblem-base';
import { useMarketInfo } from './hooks/use-market-info';
import { getVegaChain } from './lib/get-chain';

// Allows the specification of one or both logos. Undefined means both logos are shown
type marketLogos = 'BASE' | 'QUOTE' | 'BOTH' | undefined;

export type EmblemByMarketProps = {
  // The ID of the market to display logos for
  market: string;
  // The vega chain that the market is on
  vegaChain?: string;
  // Allows the Market Emblem component to display both or just one of the asset logos
  marketLogos?: marketLogos;
  // A market never has an underlying off chain contract, that's what EmblemByContract is for
  contract?: never;
  // A market never has an asset specified, that's what EmblemByAsset is for
  asset?: never;
  // Optional parameter used to configure the wrapper that contains the emblems
  wrapperClass?: string;
};

/**
 * Given a Vega Market ID, displays the base asset logo slightly overlapping
 * the quote asset logo. If the logos are not found, it will display a black
 * circle instead.
 *
 * The optional marketLogos param restrict which logos are shown, in case only
 * the quote or base is required, when only the market ID is available.
 *
 * @param market string the market ID
 * @param vegaChain string the vega chain ID (default: Vega Mainnet)
 * @returns React.Node
 */
export function EmblemByMarket(props: EmblemByMarketProps) {
  const { vegaChain, marketLogos, market, wrapperClass = '' } = props;
  const chain = getVegaChain(vegaChain);

  const data = useMarketInfo(chain, market);
  const { showBase, showQuote, logoCount } = chooseLogos(marketLogos);

  const wrapperClassString = `relative inline-block ${
    logoCount === 2 ? 'w-8' : 'w-5'
  } ${wrapperClass ?? ''}`;

  const base = data.data?.baseLogo
    ? `${URL_BASE}${data.data.baseLogo}`
    : `${URL_BASE}/missing.svg`;
  const quote = data.data?.quoteLogo
    ? `${URL_BASE}${data.data.quoteLogo}`
    : `${URL_BASE}/missing.svg`;

  return (
    <div className={wrapperClassString}>
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
            showBase ? 'left-3 absolute z-1 top-1 ' : ''
          }`}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * Parses the marketLogos options so that
 * @param selected
 * @returns
 */
export function chooseLogos(selected: marketLogos) {
  const showBase =
    selected === 'BASE' || selected === 'BOTH' || selected === undefined;
  const showQuote =
    selected === 'QUOTE' || selected === 'BOTH' || selected === undefined;

  return {
    showBase,
    showQuote,
    logoCount: (showBase ? 1 : 0) + (showQuote ? 1 : 0),
  };
}
