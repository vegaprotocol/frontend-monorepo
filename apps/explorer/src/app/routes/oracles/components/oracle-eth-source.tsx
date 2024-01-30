import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { SourceType } from './oracle';
import {
  ExternalExplorerLink,
  EthExplorerLinkTypes,
  getExternalChainLabel,
} from '../../../components/links/external-explorer-link/external-explorer-link';
import { t } from 'i18next';

interface OracleDetailsEthSourceProps {
  sourceType: SourceType;
  chain?: string;
}
/**
 * Given an Oracle that sources data from Ethereum, this component will render
 * a link to the smart contract and some basic details
 */
export function OracleEthSource({
  sourceType,
  chain = '1',
}: OracleDetailsEthSourceProps) {
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

  const chainLabel = getExternalChainLabel(chain);

  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">
        {chainLabel} {t('Contract')}
      </TableHeader>
      <TableCell modifier="bordered">
        <ExternalExplorerLink
          chain={chain}
          id={address}
          type={EthExplorerLinkTypes.address}
          code={true}
        />
        <span className="mx-3">&rArr;</span>
        <code>{sourceType.sourceType.method}</code>
      </TableCell>
    </TableRow>
  );
}
