import { URL_BASE, FILENAME } from '../config';
import { EmblemBase } from './emblem-base';
import { getVegaChain } from './lib/get-chain';

export type EmblemByContractProps = {
  contract: string;
  vegaChain?: string | undefined;
};

/**
 * Given a contract address and a chain ID, it will render an emblem for the contract
 * @param contract string the contract address
 * @param chainId string? (default: Ethereum Mainnet)
 * @returns React.Node
 */
export function EmblemByContract(p: EmblemByContractProps) {
  const chain = getVegaChain(p.vegaChain);
  const url = `${URL_BASE}/chain/${chain}/asset/${p.contract}/${FILENAME}`;

  return <EmblemBase src={url} {...p} />;
}
