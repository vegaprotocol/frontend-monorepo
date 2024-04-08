import type { EmblemByAssetProps } from './asset-emblem';
import type { EmblemByContractProps } from './contract-emblem';
import type { ImgProps } from './emblem-base';
import { isEmblemByAsset, isEmblemByMarket } from './lib/type-guard';
import { EmblemByAsset } from './asset-emblem';
import { EmblemByContract } from './contract-emblem';
import { EmblemByMarket, type EmblemByMarketProps } from './market-emblem';

export type EmblemProps = ImgProps &
  (EmblemByAssetProps | EmblemByContractProps | EmblemByMarketProps);

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

  return <EmblemByContract {...props} />;
}
