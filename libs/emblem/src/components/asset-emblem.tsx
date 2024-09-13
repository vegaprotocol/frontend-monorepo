import { assetIcons } from './svgs/assets';
import { chainIcons } from './svgs/chains';
import { Fallback } from './fallback';
import { type HTMLProps } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';

export type EmblemByAssetProps = HTMLProps<HTMLSpanElement> & {
  asset: string;
  size?: number;
  chain?: string;
  market?: never;
};

/**
 * Given a Vega asset ID, it will render an emblem for the asset
 *
 * @param asset string the asset ID
 * @param chain string the chain ID to show an optional chain icon
 * @returns React.Node
 */
export function EmblemByAsset(p: EmblemByAssetProps) {
  const size = p.size || 32;
  const AssetSvg = assetIcons[p.asset];
  const ChainSvg = p.chain ? chainIcons[p.chain] : null;

  return (
    <span {...p} className={cn('relative inline-block', p.className)}>
      {AssetSvg ? (
        <AssetSvg width={size} height={size} />
      ) : (
        <Fallback size={size} />
      )}
      {ChainSvg && (
        <ChainSvg
          className="absolute -bottom-px -right-px"
          width={16}
          height={16}
        />
      )}
    </span>
  );
}
