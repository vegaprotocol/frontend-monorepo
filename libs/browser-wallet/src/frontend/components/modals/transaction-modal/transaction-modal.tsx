import ReactTimeAgo from 'react-time-ago';

import { useInteractionStore } from '@/stores/interaction-store';

import { PageHeader } from '../../page-header';
import { Splash } from '../../splash';
import { TransactionNotAutoApproved } from './sections/auto-approval-notification';
import { CheckTransaction } from './sections/check-transaction';
import { EnrichedDetails } from './sections/enriched-details';
import { RawTransaction } from './sections/raw-transaction';
import { TransactionHeader } from './transaction-header';
import { TransactionModalFooter } from './transaction-modal-footer';

export const locators = {
  transactionWrapper: 'transaction-wrapper',
  transactionTimeAgo: 'transaction-time-ago',
};

export const TransactionModal = () => {
  const { isOpen, handleTransactionDecision, details } = useInteractionStore(
    (store) => ({
      isOpen: store.transactionModalOpen,
      handleTransactionDecision: store.handleTransactionDecision,
      details: store.currentTransactionDetails,
    })
  );

  if (!isOpen || !details) return null;
  return (
    <>
      <Splash data-testid={locators.transactionWrapper}>
        <PageHeader />

        <section className="pb-4 pt-2 px-5">
          <TransactionHeader
            origin={details.origin}
            publicKey={details.publicKey}
            name={details.name}
            transaction={details.transaction}
          />
          <TransactionNotAutoApproved details={details} />
          <CheckTransaction
            publicKey={details.publicKey}
            transaction={details.transaction}
            origin={details.origin}
          />
          <EnrichedDetails transaction={details.transaction} />
          <RawTransaction transaction={details.transaction} />
          <div
            data-testid={locators.transactionTimeAgo}
            className="text-sm text-vega-dark-300 mt-6 mb-20"
          >
            Received{' '}
            <ReactTimeAgo
              timeStyle="round"
              date={new Date(details.receivedAt)}
              locale="en-US"
            />
          </div>
        </section>
      </Splash>
      <TransactionModalFooter
        handleTransactionDecision={handleTransactionDecision}
        details={details}
      />
    </>
  );
};
