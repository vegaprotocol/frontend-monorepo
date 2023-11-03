import type { ExplorerOracleDataConnectionFragment } from '../__generated__/Oracles';
import { TimeAgo } from '../../../components/time-ago';
import { t } from '@vegaprotocol/i18n';

const cellSpacing = 'px-3';

interface OracleDataTypeProps {
  data: ExplorerOracleDataConnectionFragment['dataConnection'];
}

export function OracleData({ data }: OracleDataTypeProps) {
  if (!data || !data.edges?.length) {
    return null;
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 display-5 mt-5">
        {t('Recent data')}
      </h2>
      <table>
        <thead>
          <tr className="text-left">
            <th className={cellSpacing}>Value</th>
            <th className={cellSpacing}>Key</th>
            <th className={cellSpacing}>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.edges.map((d) => {
            if (!d) {
              return null;
            }

            const broadcastAt = d.node.externalData.data.broadcastAt;
            const node = d.node.externalData.data.data?.at(0);
            if (!node || !node.value || !node.name || !node || !broadcastAt) {
              return null;
            }

            return (
              <tr key={d.node.externalData.data.broadcastAt}>
                <td className={`${cellSpacing} font-mono`}>{node.value}</td>
                <td className={`${cellSpacing} font-mono`}>{node.name}</td>
                <td className={cellSpacing}>
                  <TimeAgo date={broadcastAt} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
