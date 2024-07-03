import { t } from '@vegaprotocol/i18n';
import { headerClasses, wrapperClasses } from '../transfer-details';
import { Icon, Loader } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@vegaprotocol/ui-toolkit';
import type { ApolloError } from '@apollo/client';
import { TransferStatus, TransferStatusMapping } from '@vegaprotocol/types';
import { IconNames } from '@blueprintjs/icons';
import isFuture from 'date-fns/isFuture';

interface TransferStatusProps {
  status: TransferStatus | undefined;
  error: ApolloError | undefined;
  loading: boolean;
}

/**
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferStatusView({ status, loading }: TransferStatusProps) {
  if (!status) {
    status = TransferStatus.STATUS_PENDING;
  }

  return (
    <div className={wrapperClasses}>
      <h2 className={headerClasses}>{t('Status')}</h2>
      <div className="relative block rounded-lg py-6 text-center p-6">
        {loading ? (
          <div className="leading-10 mt-12">
            <Loader size={'small'} />
          </div>
        ) : (
          <>
            <p className="leading-10 my-2">
              <TransferStatusIcon status={status} />
            </p>
            <p className="leading-10 my-2">{TransferStatusMapping[status]}</p>
          </>
        )}
      </div>
    </div>
  );
}

interface TransferStatusIconProps {
  status: TransferStatus;
  deliverOn?: string;
}

export function TransferStatusIcon({
  status,
  deliverOn,
}: TransferStatusIconProps) {
  const s: TransferStatus = fixStatus(status, deliverOn);
  const title = getDeliverOnTitle(status, deliverOn);

  return (
    <span title={title}>
      <Icon name={getIconForStatus(s)} className={getColourForStatus(s)} />
    </span>
  );
}

export function getDeliverOnTitle(
  status: TransferStatus,
  deliverOn?: string
): string {
  if (deliverOn) {
    const d = new Date(deliverOn);

    if (isFuture(d)) {
      return t('Scheduled for ' + d.toLocaleDateString());
    } else {
      return t('Transferred on ' + d.toLocaleDateString());
    }
  }

  // If deliverOn is not set, this is sufficient
  return TransferStatusMapping[status];
}

/**
 * One off transfers with a future delivery date have a 'status' of 'DONE'
 * because they are scheduled, but not actually transferred until the date
 *
 * @param status TransferStatus API reported status for the transfer
 * @param deliverOn String date for the transfer to be executed
 * @returns TransferStatus
 */
export function fixStatus(
  status: TransferStatus,
  deliverOn?: string
): TransferStatus {
  if (deliverOn) {
    try {
      if (isFuture(new Date(deliverOn))) {
        return TransferStatus.STATUS_PENDING;
      }
    } catch (e) {
      /* continue as normal */
    }
  }

  return status;
}

/**
 * Simple mapping from status to icon name
 * @param status TransferStatus
 * @returns IconName
 */
export function getIconForStatus(status: TransferStatus): IconName {
  switch (status) {
    case TransferStatus.STATUS_PENDING:
      return IconNames.TIME;
    case TransferStatus.STATUS_DONE:
      return IconNames.TICK;
    case TransferStatus.STATUS_REJECTED:
      return IconNames.CROSS;
    case TransferStatus.STATUS_CANCELLED:
      return IconNames.CROSS;
    default:
      return IconNames.TIME;
  }
}

/**
 * Simple mapping from status to colour
 * @param status TransferStatus
 * @returns string Tailwind classname
 */
export function getColourForStatus(status: TransferStatus): string {
  switch (status) {
    case TransferStatus.STATUS_PENDING:
      return 'text-yellow-500';
    case TransferStatus.STATUS_DONE:
      return 'text-green-500';
    case TransferStatus.STATUS_REJECTED:
      return 'text-red-500';
    case TransferStatus.STATUS_CANCELLED:
      return 'text-red-600';
    default:
      return 'text-yellow-500';
  }
}
