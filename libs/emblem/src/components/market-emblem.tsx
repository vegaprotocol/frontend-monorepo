import { URL_BASE } from '../config';
import { EmblemBase } from './emblem-base';
import { useMarketInfo } from './hooks/use-market-info';
import { getVegaChain } from './lib/get-chain';
import { t } from 'i18next';

export type EmblemByMarketProps = {
  // The ID of the market to display logos for
  market: string;
  // The vega chain that the market is on
  vegaChain?: string;
  // Overlays the icon for the source chain, if available and applicable
  showSourceChain?: boolean;
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
  const { vegaChain, market } = props;

  const chain = getVegaChain(vegaChain);
  const data = useMarketInfo(chain, market);
  const { base, quote, baseChain, quoteChain, settlementChain } = getLogoPaths(
    data.data?.baseLogo,
    data.data?.quoteLogo,
    data.data?.baseChainLogo,
    data.data?.quoteChainLogo,
    data.data?.settlementChainLogo
  );

  return (
    <div className="relative inline-block h-8 w-14 leading-[0]">
      <EmblemBase
        src={base}
        className="inline-block z-10 relative rounded-full bg-white border-2 border-vega-light-600 dark:border-white"
        {...props}
      />

      {props.showSourceChain !== false && baseChain && (
        <EmblemBase
          src={baseChain}
          width={12}
          height={12}
          alt={t('Chain logo')}
          className={`z-20 align-text-top absolute bottom-0 left-4`}
        />
      )}

      <EmblemBase
        src={quote}
        className={`inline-block ml-[-9px] z-1 rounded-full bg-white border-2 border-vega-light-600 dark:border-white`}
        {...props}
      />
      {props.showSourceChain !== false && (
        <EmblemBase
          src={quoteChain || settlementChain}
          width={12}
          height={12}
          alt={t('Chain logo')}
          className={`align-text-top absolute bottom-0 right-1`}
        />
      )}
    </div>
  );
}

type LogoPaths = {
  quote: string;
  quoteChain?: string;
  base: string;
  baseChain?: string;
  settlementChain?: string;
};

/**
 * Returns the full URL for the base and quote logos, substituting
 * the default `missing` path if either logo is not defined
 *
 * @param baseLogo
 * @param quoteLogo
 * @returns LogoPaths object containing the full URL for the base and quote logos
 */
export function getLogoPaths(
  baseLogo?: string,
  quoteLogo?: string,
  baseChainLogo?: string,
  quoteChainLogo?: string,
  settlementChainLogo?: string
): LogoPaths {
  const missing = `${URL_BASE}/missing.svg`;

  return {
    base: baseLogo ? `${URL_BASE}${baseLogo}` : missing,
    quote: quoteLogo ? `${URL_BASE}${quoteLogo}` : missing,
    quoteChain: quoteChainLogo ? `${URL_BASE}${quoteChainLogo}` : undefined,
    baseChain: baseChainLogo ? `${URL_BASE}${baseChainLogo}` : undefined,
    settlementChain: settlementChainLogo
      ? `${URL_BASE}${settlementChainLogo}`
      : undefined,
  };
}
