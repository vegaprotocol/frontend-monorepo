import { URL_BASE, DEFAULT_CHAIN, FILENAME } from '../config';
import { EmblemBase } from './emblem-base';

export type EmblemByContractProps = {
  contract: string;
  chainId?: string;
  asset?: never;
};

/**
 * Given a contract address and a chain ID, it will render an emblem for the contract
 * @param contract string the contract address
 * @param chainId string? (default: Ethereum Mainnet)
 * @returns React.Node
 */
export function EmblemByContract(p: EmblemByContractProps) {
  const url = `${URL_BASE}/chain/${
    p.chainId ? p.chainId : DEFAULT_CHAIN
  }/asset/${p.contract}/${FILENAME}`;
  return <EmblemBase src={url} {...p} />;
}
