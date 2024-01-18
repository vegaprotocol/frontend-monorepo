import type { components } from '../../../../../types/explorer';
import { TransferRepeat } from './blocks/transfer-repeat';
import { TransferRewards } from './blocks/transfer-rewards';
import { TransferParticipants } from './blocks/transfer-participants';
import { useExplorerTransferVoteQuery } from './__generated__/Transfer';
import { TransferStatusView } from './blocks/transfer-status';
import { TransferStatus } from '@vegaprotocol/types';

export type Recurring = components['schemas']['commandsv1RecurringTransfer'];
export type Metric = components['schemas']['vegaDispatchMetric'];

export const wrapperClasses =
  'border border-vega-light-150 dark:border-vega-dark-200 rounded-md pv-2 mb-5 w-full sm:w-1/4 min-w-[200px] ';
export const headerClasses =
  'bg-solid bg-vega-light-150 dark:bg-vega-dark-150 border-vega-light-150 text-center text-xl py-2 font-alpha calt';

export type Transfer = components['schemas']['commandsv1Transfer'];

interface TransferDetailsProps {
  transfer: Transfer;
  from: string;
  id: string;
  // If set, all blocks except the status one are hidden
  statusOnly?: boolean;
}

/**
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferDetails({
  transfer,
  from,
  id,
  statusOnly = false,
}: TransferDetailsProps) {
  const recurring = transfer.recurring;

  // Currently all this is passed in to TransferStatus, but the extra details
  // may be useful in the future.
  const { data, error, loading } = useExplorerTransferVoteQuery({
    variables: { id },
  });

  const status = error
    ? TransferStatus.STATUS_REJECTED
    : data?.transfer?.status;

  return (
    <div className="flex gap-5 flex-wrap">
      {statusOnly ? null : (
        <>
          <TransferParticipants from={from} transfer={transfer} />
          {recurring ? <TransferRepeat recurring={transfer.recurring} /> : null}
          {recurring && recurring.dispatchStrategy ? (
            <TransferRewards recurring={transfer.recurring} />
          ) : null}
        </>
      )}
      {status ? (
        <TransferStatusView status={status} error={error} loading={loading} />
      ) : null}
    </div>
  );
}
