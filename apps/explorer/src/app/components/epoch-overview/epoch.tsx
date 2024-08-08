import { useExplorerEpochQuery } from './__generated__/Epoch';

import { t } from '@vegaprotocol/i18n';
import { BlockLink } from '../links';
import { Time } from '../time';
import { TimeAgo } from '../time-ago';
import EpochMissingOverview from './epoch-missing';
import { Icon, Tooltip } from '@vegaprotocol/ui-toolkit';
import type { IconProps } from '@vegaprotocol/ui-toolkit';
import isPast from 'date-fns/isPast';
import { EpochSymbol } from '../links/block-link/block-link';

const borderClass = 'border-solid border-2 border-gs-200 border-collapse';

export type EpochOverviewProps = {
  id?: string;
  icon?: boolean;
};

/**
 * Displays detailed information about an epoch, given an ID. This
 * works for past epochs and current epochs - future epochs, and a
 * few other situations (see epoch-missing) will not return us
 * enough information to render this.
 *
 * The details are hidden in a tooltip, behind the epoch number
 */
export const EpochOverview = ({ id, icon = true }: EpochOverviewProps) => {
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
    return (
      <span>
        <EpochSymbol />
        {id}
      </span>
    );
  }

  const description = (
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
          <th className={`px-2 ${borderClass}`}>{t('Start')}</th>
          <td className={`px-2 ${borderClass}`}>
            {ti.firstBlock ? <BlockLink height={ti.firstBlock} /> : '-'}
          </td>
          <td className={`px-2 ${borderClass}`}>
            <Time date={ti.start} />
            <br />
            <TimeAgo date={ti.start} />
          </td>
        </tr>
        <tr>
          <th className={`px-2 ${borderClass}`}>{t('End')}</th>
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
                <br />
                <TimeAgo date={ti.end} />
              </>
            ) : (
              <span>{t('-')}</span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <Tooltip description={description}>
      <p>
        {icon ? (
          <IconForEpoch start={ti.start} end={ti.end} />
        ) : (
          <EpochSymbol />
        )}
        {id}
      </p>
    </Tooltip>
  );
};

export type IconForEpochProps = {
  start: string;
  end: string;
};

/**
 * Chooses an icon to display next to the epoch number, representing
 * when the epoch is relative to now (i.e. not yet started, started,
 * finished)
 */
export function IconForEpoch({ start, end }: IconForEpochProps) {
  const startHasPassed = start ? isPast(new Date(start)) : false;
  const endHasPassed = end ? isPast(new Date(end)) : false;

  let i: IconProps['name'] = 'calendar';

  if (!startHasPassed && !endHasPassed) {
    i = 'calendar';
  } else if (startHasPassed && !endHasPassed) {
    i = 'circle';
  } else if (startHasPassed && endHasPassed) {
    i = 'tick-circle';
  }

  return <Icon name={i} className="mr-2" />;
}

export default EpochOverview;
