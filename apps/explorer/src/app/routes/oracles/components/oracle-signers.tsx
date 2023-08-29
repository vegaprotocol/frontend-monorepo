import { PartyLink } from '../../../components/links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../components/links/eth-explorer-link/eth-explorer-link';
import { TableRow, TableCell, TableHeader } from '../../../components/table';
import { remove0x } from '@vegaprotocol/utils';

import type { SourceType } from './oracle';

export type Signer = {
  __typename?: 'ETHAddress' | 'PubKey' | undefined;
  address?: string | null;
  key?: string | null;
};

export function getAddressTypeLabel(signer: Signer) {
  const res = signer.__typename === 'ETHAddress' ? 'ETH' : 'Vega';

  // This is a hack: some older oracles were submitted before proper checks stopped
  // ETH addresses being returned as Vega addresses
  if (res === 'Vega' && signer?.key?.length !== 64) {
    return 'ETH';
  } else {
    return res;
  }
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
  } else if (signer.__typename === 'PubKey' && address.length !== 64) {
    // This is a hack: some older oracles were submitted before proper checks stopped
    // ETH addresses being returned as Vega addresses
    // Hacky 0x prefixing as a bonus
    return (
      <EthExplorerLink
        id={`0x${remove0x(address)}`}
        type={EthExplorerLinkTypes.address}
      />
    );
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
  if (!('signers' in sourceType.sourceType)) {
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
