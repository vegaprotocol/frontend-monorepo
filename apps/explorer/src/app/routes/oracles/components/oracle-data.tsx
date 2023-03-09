import { t } from '@vegaprotocol/i18n';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import filter from 'recursive-key-filter';
import type { ExplorerOracleDataConnectionFragment } from '../__generated__/Oracles';

interface OracleDataTypeProps {
  data: ExplorerOracleDataConnectionFragment;
}

/**
 * If there is data that has matched this oracle, this view will
 * render the data inside a collapsed element so that it can be viewed.
 * Currently the data is just rendered as a JSON view, because
 * that Does The Job, rather than because it's good.
 */
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
    <details data-testid="oracle-data">
      <summary>{t('Broadcast data')}</summary>
      <ul>
        {data.dataConnection.edges.map((d) => {
          if (!d) {
            return null;
          }

          return (
            <li key={d.node.externalData.data.broadcastAt}>
              <SyntaxHighlighter data={filter(d, ['__typename'])} />
            </li>
          );
        })}
      </ul>
    </details>
  );
}
