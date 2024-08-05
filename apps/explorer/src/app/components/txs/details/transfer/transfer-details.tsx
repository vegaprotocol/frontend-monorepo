import type { components } from '../../../../../types/explorer';
import { TransferRepeat } from './blocks/transfer-repeat';
import { TransferRewards } from './blocks/transfer-rewards';
import { TransferParticipants } from './blocks/transfer-participants';
import { useExplorerTransferStatusQuery } from './__generated__/Transfer';
import { TransferStatusView } from './blocks/transfer-status';
import { TransferStatus } from '@vegaprotocol/types';

export type Recurring = components['schemas']['commandsv1RecurringTransfer'];
export type Metric = components['schemas']['vegaDispatchMetric'];

export const wrapperClasses =
  'border border-gs-200  pv-2 w-full sm:w-1/3 basis-1/3';
export const headerClasses =
  'bg-solid bg-gs-200 border-gs-200 text-center text-xl py-2 font-alpha calt';

export type Transfer = components['schemas']['commandsv1Transfer'];

interface TransferDetailsProps {
  transfer: Transfer;
  from: string;
  id: string;
}

/**
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferDetails({ transfer, from, id }: TransferDetailsProps) {
  const recurring = transfer.recurring;

  // Currently all this is passed in to TransferStatus, but the extra details
  // may be useful in the future.
  const { data, error, loading } = useExplorerTransferStatusQuery({
    variables: { id },
  });

  const status = error
    ? TransferStatus.STATUS_REJECTED
    : data?.transfer?.transfer.status;

  const fees = data?.transfer?.fees?.map((fee) => {
    return {
      amount: fee?.amount ? fee.amount : '0',
      epoch: fee?.epoch ? fee.epoch : 0,
    };
  });

  return (
    <div className="flex flex-wrap">
      <TransferParticipants from={from} transfer={transfer} fees={fees} />
      {recurring ? <TransferRepeat recurring={transfer.recurring} /> : null}
      <TransferStatusView status={status} error={error} loading={loading} />
      {recurring && recurring.dispatchStrategy ? (
        <TransferRewards recurring={transfer.recurring} />
      ) : null}
    </div>
  );
}
