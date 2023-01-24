import { PartyLink } from '../../../components/links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../components/links/eth-explorer-link/eth-explorer-link';
import { TableRow, TableCell, TableHeader } from '../../../components/table';

import type { SourceType } from './oracle';

export type Signer = {
  __typename?: 'ETHAddress' | 'PubKey' | undefined;
  address?: string | null;
  key?: string | null;
};

export function getAddressTypeLabel(signer: Signer) {
  return signer.__typename === 'ETHAddress' ? 'ETH' : 'Vega';
}

export function getAddress(signer: Signer) {
  return signer.address ? signer.address : signer.key ? signer.key : null;
}

export function getAddressLink(signer: Signer) {
  const address = getAddress(signer);
  if (!address) {
    return null;
  }

  if (signer.__typename === 'ETHAddress') {
    return <EthExplorerLink id={address} type={EthExplorerLinkTypes.address} />;
  } else if (signer.__typename === 'PubKey') {
    return <PartyLink id={address} />;
  }

  return <span>{address}</span>;
}

interface OracleDetailsSignersProps {
  sourceType: SourceType;
}

/**
 * Given an Oracle, this component will render either a link to Ethereum
 * or the Vega party depending on which type is specified
 */
export function OracleSigners({ sourceType }: OracleDetailsSignersProps) {
  if (sourceType.__typename !== 'DataSourceDefinitionExternal') {
    return null;
  }
  const signers = sourceType.sourceType.signers;

  if (!signers || signers.length === 0) {
    return null;
  }

  return (
    <>
      {signers.map((s) => {
        return (
          <TableRow modifier="bordered" key={getAddress(s.signer)}>
            <TableHeader scope="row">Signer</TableHeader>
            <TableCell modifier="bordered">
              <div>
                <span data-testid="keytype">
                  {getAddressTypeLabel(s.signer)}
                </span>
                : {getAddressLink(s.signer)}
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
