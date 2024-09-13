import { type HTMLProps } from 'react';
import { Fallback } from './fallback';
import { chainIcons } from './svgs/chains';
import { cn } from '@vegaprotocol/ui-toolkit';

export type EmblemByChainProps = HTMLProps<HTMLSpanElement> & {
  chain: string;
  size?: number;
  asset?: never;
  market?: never;
};

/**
 * Given a chain Id, it will render an emblem for chain
 *
 * @param chain string or number of the chain ID
 * @returns React.Node
 */
export function EmblemByChain(p: EmblemByChainProps) {
  const size = p.size || 32;
  const ChainSvg = chainIcons[p.chain];
  return (
    <span {...p} className={cn('relative inline-block', p.className)}>
      {ChainSvg ? (
        <ChainSvg width={size} height={size} />
      ) : (
        <Fallback size={size} />
      )}
    </span>
  );
}
