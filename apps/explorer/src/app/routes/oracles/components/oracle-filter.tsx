import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import filter from 'recursive-key-filter';
import type { ExplorerOracleDataSourceFragment } from '../__generated__/Oracles';

interface OracleFilterProps {
  data: ExplorerOracleDataSourceFragment;
}

export function OracleFilter({ data }: OracleFilterProps) {
  const s = data.dataSourceSpec.spec.data.sourceType.sourceType;
  const f = s.__typename === 'DataSourceSpecConfiguration' ? s.filters : null;

  if (!f) {
    return null;
  }

  return (
    <details>
      <summary>Filter</summary>
      <SyntaxHighlighter data={filter(f, ['__typename'])} />
    </details>
  );
}
