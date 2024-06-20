import Hash from '../hash';
import { getExternalExplorerLink } from '@vegaprotocol/environment';
import { ExternalChainIcon } from './external-chain-icon';

export enum EthExplorerLinkTypes {
  block = 'block',
  address = 'address',
  tx = 'tx',
}

export type ExternalExplorerLinkProps = Partial<typeof HTMLAnchorElement> & {
  id: string;
  type: EthExplorerLinkTypes;
  // Defaults to Ethereum Mainnet, as chain support was added late
  chain?: string;
  code?: boolean;
  truncate?: boolean;
};

export const ExternalExplorerLink = ({
  id,
  type,
  chain = '1',
  code = false,
  truncate = false,
  ...props
}: ExternalExplorerLinkProps) => {
  const link = `${getExternalExplorerLink(chain)}/${type}/${id}${
    code ? '#code' : ''
  }`;
  return (
    <a
      className="underline external font-mono"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      href={link}
    >
      <ExternalChainIcon chainId={chain} />
      <Hash text={id} truncate={truncate} />
    </a>
  );
};
