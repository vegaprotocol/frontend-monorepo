import { Intent, Notification, Tooltip } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect } from 'react';

import { LoaderBone } from '@/components/loader-bone';
import { VegaSection } from '@/components/vega-section';
import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useAsyncAction } from '@/hooks/async-action';
import type { Transaction } from '@/lib/transactions';
import { useInteractionStore } from '@/stores/interaction-store';
import type { CheckTransactionResponse } from '@/types/backend';

export const locators = {
  checkTransactionLoading: 'check-transaction-loading',
  checkTransactionError: 'check-transaction-error',
  checkTransactionFailed: 'check-transaction-failed',
  checkTransactionValid: 'check-transaction-valid',
  checkTransactionErrorTooltip: 'check-transaction-tooltip',
  checkTransactionFailedTooltip: 'check-transaction-tooltip',
  checkTransactionValidTooltip: 'check-transaction-tooltip',
};

const CheckTransactionResult = ({
  loading,
  data,
  error,
}: {
  loading: boolean;
  data: CheckTransactionResponse | null;
  error: Error | null;
}) => {
  if (error) {
    return (
      <Notification
        intent={Intent.Danger}
        message={
          <Tooltip
            description={
              <div
                data-testid={locators.checkTransactionErrorTooltip}
                style={{ maxWidth: 300 }}
              >
                {error.message}
              </div>
            }
          >
            <span data-testid={locators.checkTransactionError}>
              There was a problem checking your transaction's validity, but you
              can still choose to send it.
            </span>
          </Tooltip>
        }
      />
    );
  }
  if (loading || !data) {
    return (
      <Notification
        testId={locators.checkTransactionLoading}
        message={
          <div className="flex flex-row justify-between">
            <span className="mr-2">Checking transaction validity</span>
            <LoaderBone width={10} height={2} baseSize={8} />
          </div>
        }
      />
    );
  }
  if (data.valid) {
    return (
      <Notification
        intent={Intent.Success}
        message={
          <Tooltip
            description={
              <div
                data-testid={locators.checkTransactionValidTooltip}
                style={{ maxWidth: 300 }}
              >
                This transaction has passed initial checks and is ready to be
                sent to the network.
              </div>
            }
          >
            <span data-testid={locators.checkTransactionValid}>
              Your transaction is valid.
            </span>
          </Tooltip>
        }
      />
    );
  }
  return (
    <Notification
      intent={Intent.Danger}
      message={
        <Tooltip
          description={
            <div
              data-testid={locators.checkTransactionFailedTooltip}
              style={{ maxWidth: 300 }}
            >
              You can still send this transaction but it may be rejected by the
              network.
            </div>
          }
        >
          <span data-testid={locators.checkTransactionFailed}>
            {data.error}
          </span>
        </Tooltip>
      }
    />
  );
};

export const CheckTransaction = ({
  transaction,
  publicKey,
  origin,
}: {
  transaction: Transaction;
  publicKey: string;
  origin: string;
}) => {
  const { request } = useJsonRpcClient();
  const { checkTransaction } = useInteractionStore((store) => ({
    checkTransaction: store.checkTransaction,
  }));
  const checkTx = useCallback(
    async () => await checkTransaction(request, transaction, publicKey, origin),
    [checkTransaction, publicKey, request, transaction, origin]
  );
  const { loading, error, data, loaderFunction } = useAsyncAction(checkTx);

  useEffect(() => {
    loaderFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <VegaSection>
      <CheckTransactionResult loading={loading} data={data} error={error} />
    </VegaSection>
  );
};
