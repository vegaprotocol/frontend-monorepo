import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { SourceType } from './oracle';
import {
  EthExplorerLink,
  EthExplorerLinkTypes,
} from '../../../components/links/eth-explorer-link/eth-explorer-link';

interface OracleDetailsEthSourceProps {
  sourceType: SourceType;
}
/**
 * Given an Oracle that sources data from Ethereum, this component will render
 * a link to the smart contract and some basic details
 */
export function OracleEthSource({ sourceType }: OracleDetailsEthSourceProps) {
  if (
    sourceType.__typename !== 'DataSourceDefinitionExternal' ||
    sourceType.sourceType.__typename !== 'EthCallSpec'
  ) {
    return null;
  }

  const address = sourceType.sourceType.address;

  if (!address) {
    return null;
  }

  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">Ethereum Contract</TableHeader>
      <TableCell modifier="bordered">
        <EthExplorerLink id={address} type={EthExplorerLinkTypes.address} />
        <span className="mx-3">&rArr;</span>
        <code>{sourceType.sourceType.method}</code>
      </TableCell>
    </TableRow>
  );
}
