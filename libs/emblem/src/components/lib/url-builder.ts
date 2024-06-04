import { URL_BASE, FILENAME } from '../../config';

/**
 * Generates the full URL for an asset given its contract address
 *
 * @param chain string ID of the chain (e.g. 1 for Ethereum)
 * @param contract string Full contract address
 * @returns string full path to the asset logo
 */
export function getChainAssetLogoUrl(chain: string, contract: string): string {
  return `${URL_BASE}/chain/${chain}/asset/${contract}/${FILENAME}`;
}

/**
 * Generates the full URL for an asset on Vega. An optional third parameter
 * can be used to
 *
 * @param chain Vega Chain ID for the asset
 * @param asset The asset ID
 * @param filename Optional parameter that can be used to fetch the origin chain logo instead of the asset logo
 * @returns string full path to the asset logo
 */
export function getVegaAssetLogoUrl(
  chain: string,
  asset: string,
  filename: string = FILENAME
): string {
  return `${URL_BASE}/vega/${chain}/asset/${asset}/${filename}`;
}
