import { Emblem, type EmblemProps } from '@vegaprotocol/emblem';
import { ENV } from '../../config/env';

export function EmblemWithChain(props: EmblemProps) {
  const vegaChain = ENV.vegaChainId;

  return <Emblem vegaChain={vegaChain} {...props} />;
}
