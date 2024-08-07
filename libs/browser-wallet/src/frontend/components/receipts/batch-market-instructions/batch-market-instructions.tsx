import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import objectHash from 'object-hash';
import { Fragment } from 'react';

import { getBatchTitle } from '@/lib/get-title';
import type { BatchTransactionCommands } from '@/lib/transactions';
import { TransactionKeys } from '@/lib/transactions';

import { CollapsiblePanel } from '../../collapsible-panel';
import { AmendmentView } from '../orders/amend';
import { CancellationView } from '../orders/cancellation/cancellation-view';
import { StopOrderCancellationView } from '../orders/stop-cancellation';
import { StopOrdersSubmissionView } from '../orders/stop-submission';
import { SubmissionView } from '../orders/submission';
import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';

const BATCH_COMMAND_TITLE_MAP: Record<BatchTransactionCommands, string> = {
  [TransactionKeys.ORDER_SUBMISSION]: 'Submissions',
  [TransactionKeys.ORDER_CANCELLATION]: 'Cancellations',
  [TransactionKeys.ORDER_AMENDMENT]: 'Amendments',
  [TransactionKeys.STOP_ORDERS_SUBMISSION]: 'Stop Order Submissions',
  [TransactionKeys.STOP_ORDERS_CANCELLATION]: 'Stop Order Cancellations',
};

export const locators = {
  header: 'header',
  cancellations: 'cancellations',
  amendments: 'amendments',
  submissions: 'submissions',
  stopOrderSubmissions: 'stop-order-submissions',
  stopOrderCancellations: 'stop-order-cancellations',
  noTransactionsNotification: 'no-transactions-notification',
};

const CommandSection = ({
  items,
  command,
  renderItem,
}: {
  items: any[];
  command: BatchTransactionCommands;
  renderItem: (item: any, index: number) => JSX.Element;
}) => {
  if (items.length === 0) return null;
  return (
    <div className="last-of-type:mb-0 mb-4">
      <CollapsiblePanel
        title={BATCH_COMMAND_TITLE_MAP[command]}
        initiallyOpen={true}
        panelContent={
          <>
            {items.map((item: any, index: number) => (
              <Fragment key={objectHash(item)}>
                <h2 data-testid={locators.header} className={'text-white mt-4'}>
                  {index + 1}. {getBatchTitle(command, item)}
                </h2>
                {renderItem(item, index)}
              </Fragment>
            ))}
          </>
        }
      />
    </div>
  );
};

export const BatchMarketInstructions = ({
  transaction,
}: ReceiptComponentProperties) => {
  const { batchMarketInstructions } = transaction;
  const {
    cancellations = [],
    amendments = [],
    submissions = [],
    stopOrdersSubmission: stopOrdersSubmissions = [], // For some reason this is not plural in the command
    stopOrdersCancellation: stopOrdersCancellations = [], // For some reason this is not plural in the command
  } = batchMarketInstructions;

  if (
    [
      ...cancellations,
      ...amendments,
      ...submissions,
      ...stopOrdersSubmissions, // For some reason this is not plural in the command
      ...stopOrdersCancellations,
    ].length === 0
  )
    return (
      <Notification
        testId={locators.noTransactionsNotification}
        message="Batch market instructions did not contain any transactions. Please view the raw transaction and check this is the transaction you wish to send."
        intent={Intent.Warning}
      />
    );
  return (
    <ReceiptWrapper>
      <CommandSection
        items={cancellations}
        command={TransactionKeys.ORDER_CANCELLATION}
        renderItem={(c) => <CancellationView cancellation={c} />}
      />
      <CommandSection
        items={amendments}
        command={TransactionKeys.ORDER_AMENDMENT}
        renderItem={(a) => <AmendmentView amendment={a} />}
      />
      <CommandSection
        items={submissions}
        command={TransactionKeys.ORDER_SUBMISSION}
        renderItem={(s) => <SubmissionView orderSubmission={s} />}
      />
      <CommandSection
        items={stopOrdersCancellations}
        command={TransactionKeys.STOP_ORDERS_CANCELLATION}
        renderItem={(c) => (
          <StopOrderCancellationView stopOrdersCancellation={c} />
        )}
      />
      <CommandSection
        items={stopOrdersSubmissions}
        command={TransactionKeys.STOP_ORDERS_SUBMISSION}
        renderItem={(s) => (
          <StopOrdersSubmissionView stopOrdersSubmission={s} />
        )}
      />
    </ReceiptWrapper>
  );
};
