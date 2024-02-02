import { TableRow, TableCell, TableHeader } from '../../../components/table';
import type { SourceType } from './oracle';

/**
 * Basic function to determine if a source is internal or external.
 *
 * This should be distinguishable using __typename, but the type is incorrectly
 * reported at the moment, so instead we check the filters.
 *
 * @param s SourceType
 * @returns boolean True if the source is internal
 */
export function isInternalSourceType(s: SourceType) {
  if ('filters' in s.sourceType) {
    const filters = s.sourceType.filters;

    if (filters) {
      return (
        filters?.filter((f) => {
          return f.key.name?.indexOf('vegaprotocol.builtin.') === 0;
        }).length > 0
      );
    }
  }

  return false;
}

export function getExternalType(s: SourceType) {
  if (s.sourceType.__typename === 'EthCallSpec') {
    return 'Contract Call';
  } else {
    return 'External Data';
  }
}

export function getTypeString(s: SourceType) {
  const isInternal = isInternalSourceType(s);
  return isInternal ? 'Internal data' : getExternalType(s);
}

interface OracleDetailsTypeProps {
  sourceType: SourceType;
}

/**
 * Renders a a single table row for the Oracle Details view that shows
 * if the oracle is using the internal time oracle or external data
 */
export function OracleDetailsType({ sourceType }: OracleDetailsTypeProps) {
  if (!sourceType) {
    return null;
  }

  return (
    <TableRow modifier="bordered">
      <TableHeader scope="row">Type</TableHeader>
      <TableCell modifier="bordered">{getTypeString(sourceType)}</TableCell>
    </TableRow>
  );
}
