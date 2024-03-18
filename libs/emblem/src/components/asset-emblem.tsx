import { URL_BASE, DEFAULT_VEGA_CHAIN, FILENAME } from '../config';
import { EmblemBase } from './emblem-base';

export type EmblemByAssetProps = {
  asset: string;
  vegaChain?: string;
  contract?: never;
};

/**
 * Given a Vega asset ID, it will render an emblem for the asset
 *
 * @param asset string the asset ID
 * @param vegaChain string the vega chain ID (default: Vega Mainnet)
 * @returns React.Node
 */
export function EmblemByAsset(p: EmblemByAssetProps) {
  const url = `${URL_BASE}/vega/${
    p.vegaChain ? p.vegaChain : DEFAULT_VEGA_CHAIN
  }/asset/${p.asset}/${FILENAME}`;

  return <EmblemBase src={url} {...p} />;
}
