import {
  useExplorerEpochQuery,
  useExplorerFutureEpochQuery,
} from './__generated__/Epoch';

import { t } from '@vegaprotocol/react-helpers';
import { BlockLink } from '../links';
import { Time } from '../time';
import { TimeAgo } from '../time-ago';
import parseISO from 'date-fns/parseISO';
import addSeconds from 'date-fns/addSeconds';
import parse from 'date-fns/parse';
import formatDistance from 'date-fns/formatDistance';

const borderClass =
  'border-solid border-2 border-vega-dark-150 border-collapse';

export type EpochMissingOverviewProps = {
  missingEpochId?: string;
};

/**
 */
const EpochMissingOverview = ({
  missingEpochId,
}: EpochMissingOverviewProps) => {
  const { data, error, loading } = useExplorerFutureEpochQuery();

  if (!data || loading || error) {
    return <span>{missingEpochId}</span>;
  }

  let label = 'Missing data';

  const epochLength = data.networkParameter?.value || '';
  const epochLengthInSeconds = getSeconds(epochLength);

  if (missingEpochId && data.epoch.id && data.epoch.timestamps.start) {
    const missing = parseInt(missingEpochId);
    const current = parseInt(data.epoch.id);
    const startFrom = new Date(data.epoch.timestamps.start);

    const diff = missing - current;
    const futureDate = addSeconds(startFrom, diff * epochLengthInSeconds);
    label = `${futureDate.toLocaleString()} - roughly ${formatDistance(
      futureDate,
      startFrom
    )} `;
  }

  return (
    <details className="inline-block pl-2 cursor-pointer">
      <summary className="mr-5">{missingEpochId}</summary>
      <div className="text-xs m-2">
        <p>{label}</p>
      </div>
    </details>
  );
};

export default EpochMissingOverview;

function getSeconds(str: string) {
  let seconds = 0;
  const months = str.match(/(\d+)\s*M/);
  const days = str.match(/(\d+)\s*D/);
  const hours = str.match(/(\d+)\s*h/);
  const minutes = str.match(/(\d+)\s*m/);
  const secs = str.match(/(\d+)\s*s/);
  if (months) {
    seconds += parseInt(months[1]) * 86400 * 30;
  }
  if (days) {
    seconds += parseInt(days[1]) * 86400;
  }
  if (hours) {
    seconds += parseInt(hours[1]) * 3600;
  }
  if (minutes) {
    seconds += parseInt(minutes[1]) * 60;
  }
  if (secs) {
    seconds += parseInt(secs[1]);
  }
  return seconds;
}
