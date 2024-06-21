import type { ImgProps } from './emblem-base';
import {
  isEmblemByAsset,
  isEmblemByChain,
  isEmblemByMarket,
} from './lib/type-guard';
import { EmblemByAsset, type EmblemByAssetProps } from './asset-emblem';
import {
  EmblemByContract,
  type EmblemByContractProps,
} from './contract-emblem';
import { EmblemByChain, type EmblemByChainProps } from './chain-emblem';
import { EmblemByMarket, type EmblemByMarketProps } from './market-emblem';

export type EmblemProps = ImgProps &
  (
    | EmblemByAssetProps
    | EmblemByContractProps
    | EmblemByMarketProps
    | EmblemByChainProps
  );

/**
 * A generic component that will render an emblem for a Vega asset or a contract, depending on the props
 * @returns React.Node
 */
export function Emblem(props: EmblemProps) {
  if (isEmblemByAsset(props)) {
    return <EmblemByAsset {...props} />;
  }

  if (isEmblemByMarket(props)) {
    return <EmblemByMarket {...props} />;
  }

  if (isEmblemByChain(props)) {
    return <EmblemByChain {...props} />;
  }

  return <EmblemByContract {...props} />;
}
