import { URL_BASE, FILENAME } from '../config';
import { EmblemBase } from './emblem-base';
import { getVegaChain } from './lib/get-chain';

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
  const chain = getVegaChain(p.vegaChain);
  const url = `${URL_BASE}/vega/${chain}/asset/${p.asset}/${FILENAME}`;

  return <EmblemBase src={url} {...p} />;
}
