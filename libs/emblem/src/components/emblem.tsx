import type { EmblemByAssetProps } from './asset-emblem';
import type { EmblemByContractProps } from './contract-emblem';
import type { ImgProps } from './emblem-base';
import { isEmblemByAsset } from './lib/type-guard';
import { EmblemByAsset } from './asset-emblem';
import { EmblemByContract } from './contract-emblem';

export type EmblemProps = ImgProps &
  (EmblemByAssetProps | EmblemByContractProps);

/**
 * A generic component that will render an emblem for a Vega asset or a contract, depending on the props
 * @returns React.Node
 */
export function Emblem(props: EmblemProps) {
  if (isEmblemByAsset(props)) {
    return <EmblemByAsset {...props} />;
  } else {
    return <EmblemByContract {...props} />;
  }
}
