import { useExplorerEpochQuery } from './__generated__/Epoch';

import { t } from '@vegaprotocol/react-helpers';
import { BlockLink } from '../links';
import { Time } from '../time';
import { TimeAgo } from '../time-ago';
import EpochMissingOverview from './epoch-missing';

const borderClass =
  'border-solid border-2 border-vega-dark-150 border-collapse';

export type EpochOverviewProps = {
  id?: string;
};

/**
 */
const EpochOverview = ({ id }: EpochOverviewProps) => {
  const { data, error, loading } = useExplorerEpochQuery({
    variables: { id: id || '' },
  });

  const ti = data?.epoch.timestamps;
  if (
    error?.message &&
    error.message.includes('no resource corresponding to this id')
  ) {
    return <EpochMissingOverview missingEpochId={id} />;
  }

  if (!ti || loading || error) {
    return <span>{id}</span>;
  }

  return (
    <details className="inline-block pl-2 cursor-pointer">
      <summary className="mr-5">{id}</summary>
      <table className="text-xs m-2">
        <thead>
          <tr>
            <th></th>
            <th className={`text-center ${borderClass}`}>{t('Block')}</th>
            <th className={`text-center ${borderClass}`}>{t('Time')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={`px-2 ${borderClass}`}>{t('Epoch start')}</th>
            <td className={`px-2 ${borderClass}`}>
              {ti.firstBlock ? <BlockLink height={ti.firstBlock} /> : '-'}
            </td>
            <td className={`px-2 ${borderClass}`}>
              <Time date={ti.start} />
              <span className="mx-2">&mdash;</span>
              <TimeAgo date={ti.start} />
            </td>
          </tr>
          <tr>
            <th className={`px-2 ${borderClass}`}>{t('Epoch end')}</th>
            <td className={`px-2 ${borderClass}`}>
              {ti.lastBlock ? (
                <BlockLink height={ti.lastBlock} />
              ) : (
                t('In progress')
              )}
            </td>
            <td className={`px-2 ${borderClass}`}>
              {ti.end ? (
                <>
                  <Time date={ti.end} />
                  <span className="mx-2">&mdash;</span>
                  <TimeAgo date={ti.end} />
                </>
              ) : (
                <span>{t('-')}</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  );
};

export default EpochOverview;
