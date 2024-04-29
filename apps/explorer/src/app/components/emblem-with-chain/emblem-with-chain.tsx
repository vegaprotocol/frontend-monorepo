import { Emblem, type EmblemProps } from '@vegaprotocol/emblem';
import { ENV } from '../../config/env';

/**
 * Wrapper component for the library Emblem wrapper, that
 * provides the chain ID. This is not in the library as
 * it is specific to the Vega Explorer, and different in
 * Trading & Governance. If the chain ID config is
 * standardised, this can move in to the library.
 *
 * @param props Any valid Emblem props
 * @returns React.Node Emblem wrapper with the chain ID set
 */
export function EmblemWithChain(props: EmblemProps) {
  const vegaChain = ENV.vegaChainId;

  return <Emblem vegaChain={vegaChain} {...props} />;
}
