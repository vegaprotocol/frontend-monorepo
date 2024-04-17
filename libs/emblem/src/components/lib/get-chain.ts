import { DEFAULT_VEGA_CHAIN } from '../../config';

/**
 * Simple wrapper function to parse Vega Chain ID props, or
 * return a default chain if it is not set
 *
 * @param vegaChainId Either a string containing a chain ID or undefined
 * @returns string Chain ID
 */
export function getVegaChain(vegaChainId?: string): string {
  if (vegaChainId && typeof vegaChainId === 'string') {
    return vegaChainId;
  }

  return DEFAULT_VEGA_CHAIN;
}
