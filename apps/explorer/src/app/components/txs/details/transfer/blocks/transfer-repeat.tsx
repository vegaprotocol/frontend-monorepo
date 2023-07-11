import { t } from '@vegaprotocol/i18n';
import { Icon } from '@vegaprotocol/ui-toolkit';
import EpochOverview from '../../../../epoch-overview/epoch';
import { useExplorerFutureEpochQuery } from '../../../../epoch-overview/__generated__/Epoch';
import { headerClasses, wrapperClasses } from '../transfer-details';
import type { IconProps } from '@vegaprotocol/ui-toolkit';
import type { Recurring } from '../transfer-details';

interface TransferRepeatProps {
  recurring: Recurring;
}

/**
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferRepeat({ recurring }: TransferRepeatProps) {
  const { data } = useExplorerFutureEpochQuery();

  if (!recurring) {
    return null;
  }

  return (
    <div className={wrapperClasses}>
      <h2 className={headerClasses}>{t('Active epochs')}</h2>
      <div className="relative block rounded-lg py-6 text-center p-6">
        <div>
          <EpochOverview id={recurring.startEpoch} />
        </div>
        <p className="leading-10 my-2">
          <IconForEpoch
            start={recurring.startEpoch}
            end={recurring.endEpoch}
            current={data?.epoch.id}
          />
        </p>
        <div>
          {recurring.endEpoch ? (
            <EpochOverview id={recurring.endEpoch} />
          ) : (
            <span>{t('Forever')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export type IconForTransferProps = {
  current?: string;
  start?: string;
  end?: string;
};

/**
 * Pick an icon rto represent the state of the repetition for this recurring
 * transfer. It can be unstarted, in progress, or complete.
 *
 * @param start The epoch in which the transfer first occurs
 * @param end The last epoch in which the transfer occurs
 * @param current The current epoch
 */
function IconForEpoch({ start, end, current }: IconForTransferProps) {
  let i: IconProps['name'] = 'repeat';

  if (current && start && end) {
    const startEpoch = parseInt(start);
    const endEpoch = parseInt(end);
    const currentEpoch = parseInt(current);

    if (currentEpoch > endEpoch) {
      // If we've finished
      i = 'updated';
    } else if (startEpoch > currentEpoch) {
      // If we haven't yet started
      i = 'time';
    } else if (startEpoch < currentEpoch && endEpoch > currentEpoch) {
      i = 'repeat';
    }
  }

  return <Icon name={i} className="mr-2" />;
}
