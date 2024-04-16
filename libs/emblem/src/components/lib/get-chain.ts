import { DEFAULT_VEGA_CHAIN } from '../../config';

export function getVegaChain(vegaChainId?: string): string {
  if (vegaChainId && typeof vegaChainId === 'string') {
    return vegaChainId;
  }

  return DEFAULT_VEGA_CHAIN;
}
