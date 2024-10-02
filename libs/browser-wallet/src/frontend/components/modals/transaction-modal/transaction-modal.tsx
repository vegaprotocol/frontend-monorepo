import { useInteractionStore } from '@/stores/interaction-store';

import { Splash } from '../../splash';
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
        <section className="pb-28 pt-2 px-5">
          <TransactionHeader
            receivedAt={details.receivedAt}
            name={details.name}
            transaction={details.transaction}
          />
          <CheckTransaction
            publicKey={details.publicKey}
            transaction={details.transaction}
            origin={details.origin}
          />
          <EnrichedDetails transaction={details.transaction} />
          <RawTransaction transaction={details.transaction} />
        </section>
      </Splash>
      <TransactionModalFooter
        handleTransactionDecision={handleTransactionDecision}
        details={details}
      />
    </>
  );
};
