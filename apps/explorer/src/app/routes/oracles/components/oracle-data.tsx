import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import filter from 'recursive-key-filter';
import type { ExplorerOracleDataConnectionFragment } from '../__generated__/Oracles';

interface OracleDataTypeProps {
  data: ExplorerOracleDataConnectionFragment;
}

export function OracleData({ data }: OracleDataTypeProps) {
  if (
    !data ||
    !data.dataConnection ||
    !data.dataConnection.edges?.length ||
    data.dataConnection.edges.length > 1
  ) {
    return null;
  }

  return (
    <details>
      <summary>Broadcast Data</summary>
      <ul>
        {data.dataConnection.edges.map((d) => {
          if (!d) {
            return null;
          }

          return (
            <li>
              <SyntaxHighlighter data={filter(d, ['__typename'])} />
            </li>
          );
        })}
      </ul>
    </details>
  );
}
