import { EmblemBase } from './emblem-base';
import { getVegaChain } from './lib/get-chain';
import { getChainAssetLogoUrl } from './lib/url-builder';

export type EmblemByContractProps = {
  contract: string;
  vegaChain?: string | undefined;
  showSourceChain?: boolean;
};

/**
 * Given a contract address and a chain ID, it will render an emblem for the contract
 * @param contract string the contract address
 * @param chainId string? (default: Ethereum Mainnet)
 * @returns React.Node
 */
export function EmblemByContract(p: EmblemByContractProps) {
  const chain = getVegaChain(p.vegaChain);
  const url = getChainAssetLogoUrl(chain, p.contract);

  return <EmblemBase src={url} {...p} />;
}
