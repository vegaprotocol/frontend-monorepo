import { EmblemByAsset, type EmblemByAssetProps } from './asset-emblem';
import { EmblemByChain, type EmblemByChainProps } from './chain-emblem';
import { EmblemByMarket, type EmblemByMarketProps } from './market-emblem';

export type EmblemProps =
  | EmblemByAssetProps
  | EmblemByChainProps
  | EmblemByMarketProps;

/**
 * A generic component that will render an emblem for a Vega asset or a contract, depending on the props
 * @returns React.Node
 */
export function Emblem(props: EmblemProps) {
  if (props.asset) {
    return <EmblemByAsset {...props} />;
  }

  if (props.market) {
    return <EmblemByMarket {...props} />;
  }

  if (props.chain) {
    return <EmblemByChain {...(props as EmblemByChainProps)} />;
  }

  throw new Error('invalid props for Emblem');
}
