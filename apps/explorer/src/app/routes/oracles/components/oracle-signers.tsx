import { PartyLink } from '../../../components/links';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../components/links/eth-explorer-link/eth-explorer-link';
import { TableRow, TableCell, TableHeader } from '../../../components/table';

import type { SourceType } from './oracle';

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
        let key;
        switch (s.signer.__typename) {
          case 'ETHAddress':
            if (s.signer.address) {
              key = (
                <span>
                  ETH:{' '}
                  <EthExplorerLink
                    id={s.signer.address}
                    type={EthExplorerLinkTypes.address}
                  />
                </span>
              );
            }
            break;
          case 'PubKey':
            if (s.signer.key) {
              key = (
                <span>
                  Vega: <PartyLink id={s.signer.key} />
                </span>
              );
            }
            break;
        }
        return (
          <TableRow modifier="bordered">
            <TableHeader scope="row">Signer</TableHeader>
            <TableCell modifier="bordered">{key}</TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
