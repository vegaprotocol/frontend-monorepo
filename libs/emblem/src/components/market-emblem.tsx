import { URL_BASE } from '../config';
import { EmblemBase } from './emblem-base';
import { useMarketInfo } from './hooks/use-market-info';
import { getVegaChain } from './lib/get-chain';
import classNames from 'classnames';

// Allows the specification of one or both logos. Undefined means both logos are shown
type MarketLogos = 'BASE' | 'QUOTE' | 'BOTH' | undefined;

export type EmblemByMarketProps = {
  // The ID of the market to display logos for
  market: string;
  // The vega chain that the market is on
  vegaChain?: string;
  // Allows the Market Emblem component to display both or just one of the asset logos
  marketLogos?: MarketLogos;
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
  const { vegaChain, marketLogos, market } = props;
  const { showBase, showQuote, logoCount } = chooseLogos(marketLogos);

  const chain = getVegaChain(vegaChain);
  const data = useMarketInfo(chain, market);
  const { base, quote } = getLogoPaths(
    data.data?.baseLogo,
    data.data?.quoteLogo
  );

  // Widths are calculated here as they are required for using absolute positioning to
  // render the logos as overlapping. Moving to blocks with negative margins should work
  // and could remove this calculation, but was not working reliably cross platform.
  const wrapperClassString = classNames('relative inline-block', {
    'w-8': logoCount === 2,
    'w-5': logoCount === 1,
  });

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

type LogoPaths = {
  base: string;
  quote: string;
};

/**
 * Returns the full URL for the base and quote logos, substituting
 * the default `missing` path if either logo is not defined
 *
 * @param baseLogo
 * @param quoteLogo
 * @returns LogoPaths object containing the full URL for the base and quote logos
 */
export function getLogoPaths(baseLogo?: string, quoteLogo?: string): LogoPaths {
  const base = baseLogo ? `${URL_BASE}${baseLogo}` : `${URL_BASE}/missing.svg`;
  const quote = quoteLogo
    ? `${URL_BASE}${quoteLogo}`
    : `${URL_BASE}/missing.svg`;

  return {
    base,
    quote,
  };
}

type LogoOptions = {
  showBase: boolean;
  showQuote: boolean;
  logoCount: number;
};

/**
 * Parses the marketLogos options, correctly inferring defaults
 * and calculating the size the container needs to be based on
 * how many logos are shown
 *
 * @param selected
 * @returns LogoOptions
 */
export function chooseLogos(selected: MarketLogos): LogoOptions {
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
