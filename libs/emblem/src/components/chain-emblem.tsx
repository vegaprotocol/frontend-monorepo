import { EmblemBase } from './emblem-base';

export type EmblemByChainProps = {
  chainId: string | number;
};

/**
 * Given a chain Id, it will render an emblem for chain
 *
 * @param chainId string or number of the chain ID
 * @returns React.Node
 */
export function EmblemByChain(p: EmblemByChainProps) {
  const src = `https://icon.vega.xyz/chain/${p.chainId}/logo.svg`;
  return (
    <div className="relative inline-block">
      <EmblemBase src={src} className="border-2" {...p} />
    </div>
  );
}
