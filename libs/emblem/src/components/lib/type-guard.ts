import type { EmblemByAssetProps } from '../asset-emblem';
import type { EmblemByContractProps } from '../contract-emblem';
import type { EmblemByMarketProps } from '../market-emblem';

/**
 * Type guard for generic Emblem component, which ends up rendering either an EmblemByContract
 * EmblemByAsset, or EmblemByMarket depending on the arguments
 */
export function isEmblemByAsset(
  args: EmblemByAssetProps | EmblemByContractProps | EmblemByMarketProps
): args is EmblemByAssetProps {
  return (args as EmblemByAssetProps).asset !== undefined;
}

/**
 * Type guard for the generic Emblem component, which will check if the props match the required
 * props for the EmblemByMarket component
 */
export function isEmblemByMarket(
  args: EmblemByAssetProps | EmblemByContractProps | EmblemByMarketProps
): args is EmblemByMarketProps {
  return (args as EmblemByMarketProps).market !== undefined;
}
