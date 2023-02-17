import type { components } from '../../../../../types/explorer';
import { TransferRepeat } from './blocks/transfer-repeat';
import { TransferRewards } from './blocks/transfer-rewards';
import { TransferParticipants } from './blocks/transfer-participants';

export type Recurring = components['schemas']['v1RecurringTransfer'];
export type Metric = components['schemas']['vegaDispatchMetric'];

export const wrapperClasses =
  'border border-zinc-200 dark:border-zinc-800 rounded-md pv-2 mb-5 w-full sm:w-1/4 min-w-[200px] ';
export const headerClasses =
  'bg-solid bg-zinc-200 dark:bg-zinc-800 border-zinc-200 text-center text-xl py-2 font-alpha';

export type Transfer = components['schemas']['commandsv1Transfer'];

interface TransferDetailsProps {
  transfer: Transfer;
  from: string;
}

/**
 * Renderer for a transfer. These can vary quite
 * widely, essentially every field can be null.
 *
 * @param transfer A recurring transfer object
 */
export function TransferDetails({ transfer, from }: TransferDetailsProps) {
  const recurring = transfer.recurring;

  return (
    <div className="flex gap-5 flex-wrap">
      <TransferParticipants from={from} transfer={transfer} />
      {recurring ? <TransferRepeat recurring={transfer.recurring} /> : null}
      {recurring && recurring.dispatchStrategy ? (
        <TransferRewards recurring={transfer.recurring} />
      ) : null}
    </div>
  );
}
