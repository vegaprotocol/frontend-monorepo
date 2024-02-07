import { t } from '@vegaprotocol/i18n';
import { headerClasses, wrapperClasses } from '../transfer-details';
import { Icon, Loader } from '@vegaprotocol/ui-toolkit';
import type { IconName } from '@vegaprotocol/ui-toolkit';
import type { ApolloError } from '@apollo/client';
import { TransferStatus, TransferStatusMapping } from '@vegaprotocol/types';
import { IconNames } from '@blueprintjs/icons';

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
      <h2 className={headerClasses}>{t('Transfer Status')}</h2>
      <div className="relative block rounded-lg py-6 text-center p-6">
        {loading ? (
          <div className="leading-10 mt-12">
            <Loader size={'small'} />
          </div>
        ) : (
          <>
            <p className="leading-10 my-2">
              <Icon
                name={getIconForStatus(status)}
                className={getColourForStatus(status)}
              />
            </p>
            <p className="leading-10 my-2">{TransferStatusMapping[status]}</p>
          </>
        )}
      </div>
    </div>
  );
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
    default:
      return 'text-yellow-500';
  }
}
