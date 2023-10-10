import { DepositStatus } from '@vegaprotocol/types';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDepositBusEventSubscription } from './__generated__/TransactionResult';
import { useEthTransactionStore } from './use-ethereum-transaction-store';

export const useEthTransactionUpdater = () => {
  const { pubKey } = useVegaWallet();
  const updateDeposit = useEthTransactionStore((state) => state.updateDeposit);
  const variables = { partyId: pubKey || '' };
  const skip = !pubKey;
  useDepositBusEventSubscription({
    variables,
    skip,
    onData: ({ data: result }) =>
      result.data?.busEvents?.forEach((event) => {
        if (
          event.event.__typename === 'Deposit' &&
          // Note there is a bug in data node where the subscription is not emitted when the status
          // changes from 'Open' to 'Finalized' as a result the deposit UI will hang in a pending state right now
          // https://github.com/vegaprotocol/data-node/issues/460
          event.event.status === DepositStatus.STATUS_FINALIZED
        ) {
          updateDeposit(event.event);
        }
      }),
  });
};
