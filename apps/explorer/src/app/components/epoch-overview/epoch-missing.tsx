import { useExplorerFutureEpochQuery } from './__generated__/Epoch';

import addSeconds from 'date-fns/addSeconds';
import formatDistance from 'date-fns/formatDistance';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import isFuture from 'date-fns/isFuture';
import { isValidDate } from '@vegaprotocol/react-helpers';

export type EpochMissingOverviewProps = {
  missingEpochId?: string;
};

/**
 * Renders a set of details for an epoch that has no representation in the
 * data node. This is primarily for one of two reasons:
 *
 * 1. The epoch hasn't happened yet
 * 2. The epoch happened before a snapshot, and thus the details don't exist
 *
 * This component is used when the API has responded with no data for an epoch
 * by ID, so we already know that we can't display start time/block etc.
 *
 * We can detect 1 if the epoch is a higher number than the current epoch
 * We can detect 2 if the epoch is in the past, but we still get no response.
 */
const EpochMissingOverview = ({
  missingEpochId,
}: EpochMissingOverviewProps) => {
  const { data, error, loading } = useExplorerFutureEpochQuery();

  // This should not happen, but it's easily handled
  if (!missingEpochId) {
    return <span data-testid="empty">-</span>;
  }

  // No data should also not happen - we've requested the current epoch. This
  // could happen at chain restart, but shouldn't. If it does, fallback.
  if (!data || loading || error) {
    return <span data-testid="empty">{missingEpochId}</span>;
  }

  // If we have enough information to predict a future or past block time, let's do it
  if (
    !missingEpochId ||
    !data.epoch.id ||
    !data.epoch.timestamps.start ||
    !data?.networkParameter?.value
  ) {
    return <span data-testid="empty">{missingEpochId}</span>;
  }

  const { label, isInFuture } = calculateEpochData(
    data.epoch.id,
    missingEpochId,
    data.epoch.timestamps.start,
    data.networkParameter.value
  );

  return (
    <Tooltip description={<p className="text-xs m-2">{label}</p>}>
      <p>
        {isInFuture ? (
          <Icon name="calendar" className="mr-1" />
        ) : (
          <Icon name="outdated" className="mr-1" />
        )}
        {missingEpochId}
      </p>
    </Tooltip>
  );
};

export function calculateEpochData(
  currentEpochId: string,
  missingEpochId: string,
  epochStart: string,
  epochLength: string
) {
  // Blank string will be return 0 seconds from getSecondsFromInterval
  const epochLengthInSeconds = getSecondsFromInterval(epochLength);

  if (!epochStart || !epochLength) {
    // Let's just take a guess
    return {
      label: 'Missing data',
      isInFuture: parseInt(missingEpochId) > parseInt(currentEpochId),
    };
  }

  const startFrom = new Date(epochStart);

  const diff = parseInt(missingEpochId) - parseInt(currentEpochId);
  const futureDate = addSeconds(startFrom, diff * epochLengthInSeconds);

  const label =
    isValidDate(futureDate) && isValidDate(startFrom)
      ? `Estimate: ${futureDate.toLocaleString()} - ${formatDistance(
          futureDate,
          startFrom,
          { addSuffix: true }
        )}`
      : 'Missing data';

  return {
    label,
    isInFuture: isFuture(futureDate),
  };
}

export default EpochMissingOverview;

/**
 * Parses the interval string we get for the epoch length from the
 * network parameter API. These are in the format '1D2H3m' for 1 day,
 * 2 hours and 3 minutes.
 *
 * @param str Interval string
 * @returns integer the number of seconds the interval represents
 */
export function getSecondsFromInterval(str: string) {
  let seconds = 0;

  if (!str || !str.match) {
    return seconds;
  }

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
