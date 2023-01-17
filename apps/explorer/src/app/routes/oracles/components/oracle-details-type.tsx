import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { SourceType } from './oracle';

export type SourceTypeName = SourceType['__typename'] | undefined;

interface OracleDetailsTypeProps {
  type: SourceTypeName;
}

/**
 * Renders a a single table row for the Oracle Details view that shows
 * if the oracle is using the internal time oracle or external data
 */
export function OracleDetailsType({ type }: OracleDetailsTypeProps) {
  if (!type) {
    return null;
  }
  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">Type</TableHeader>
      <TableCell modifier="bordered">
        {type === 'DataSourceDefinitionInternal'
          ? 'Internal time'
          : 'External data'}
      </TableCell>
    </TableRow>
  );
}
