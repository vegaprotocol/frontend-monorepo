import type { EmblemByAssetProps } from '../asset-emblem';
import type { EmblemByContractProps } from '../contract-emblem';
import type { EmblemByMarketProps } from '../market-emblem';
import type { EmblemByChainProps } from '../chain-emblem';

type UnknownEmblemProps =
  | EmblemByAssetProps
  | EmblemByContractProps
  | EmblemByMarketProps
  | EmblemByChainProps;

/**
 * Type guard for generic Emblem component, which ends up rendering either an EmblemByContract
 * EmblemByAsset, or EmblemByMarket depending on the arguments
 */
export function isEmblemByAsset(
  args: UnknownEmblemProps
): args is EmblemByAssetProps {
  return (args as EmblemByAssetProps).asset !== undefined;
}

/**
 * Type guard for the generic Emblem component, which will check if the props match the required
 * props for the EmblemByMarket component
 */
export function isEmblemByMarket(
  args: UnknownEmblemProps
): args is EmblemByMarketProps {
  return (args as EmblemByMarketProps).market !== undefined;
}

/**
 * Type guard for the generic Emblem component, which will check if the props match the required
 * props for the EmblemByChain component
 */
export function isEmblemByChain(
  args: UnknownEmblemProps
): args is EmblemByChainProps {
  return (args as EmblemByChainProps).chainId !== undefined;
}
