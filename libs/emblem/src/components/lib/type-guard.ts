import type { EmblemByAssetProps } from '../asset-emblem';
import type { EmblemByContractProps } from '../contract-emblem';

/**
 * Type guard for generic Emblem component, which ends up rendering either an EmblemByContract
 * or EmblemByAsset depending on the arguments
 */
export function isEmblemByAsset(
  args: EmblemByAssetProps | EmblemByContractProps
): args is EmblemByAssetProps {
  return (args as EmblemByAssetProps).asset !== undefined;
}
