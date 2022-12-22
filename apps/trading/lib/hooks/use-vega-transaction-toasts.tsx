import { useCallback, useMemo } from 'react';
import compact from 'lodash/compact';
import type {
  OrderBusEventFieldsFragment,
  VegaStoredTxState,
  WithdrawalBusEventFieldsFragment,
  WithdrawSubmissionBody,
} from '@vegaprotocol/wallet';
import {
  isOrderAmendmentTransaction,
  isOrderCancellationTransaction,
  isOrderSubmissionTransaction,
  isWithdrawTransaction,
  useVegaTransactionStore,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import {
  Button,
  ExternalLink,
  Intent,
  TransactionDetails,
} from '@vegaprotocol/ui-toolkit';
import { addDecimalsFormatNumber, Size, t } from '@vegaprotocol/react-helpers';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { useEthWithdrawApprovalsStore } from '@vegaprotocol/web3';
import { DApp, EXPLORER_TX, useLinks } from '@vegaprotocol/environment';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import { getRejectionReason } from '@vegaprotocol/orders';

const intentMap: { [s in VegaTxStatus]: Intent } = {
  Default: Intent.Primary,
  Requested: Intent.Warning,
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Complete: Intent.Success,
};

type OrderDetailsProps = {
  label: string;
  order: OrderBusEventFieldsFragment;
};

const OrderDetails = ({ label, order }: OrderDetailsProps) => {
  const asset =
    order.market.tradableInstrument.instrument.product.settlementAsset;
  const num = addDecimalsFormatNumber(order.price, order.market.decimalPlaces);
  return (
    <div className="mt-[5px]">
      <span className="font-mono text-xs p-1 bg-gray-100 rounded">
        {label}{' '}
        <Size
          side={order.side}
          value={order.size}
          positionDecimalPlaces={order.market.positionDecimalPlaces}
          forceTheme="light"
        />{' '}
        @ {num} {asset.symbol}
      </span>
    </div>
  );
};

enum VegaTransactionType {
  WITHDRAW,
  ORDER_SUBMISSION,
  ORDER_CANCELLATION,
  ORDER_AMENDMENT,
}

const transactionLabels: { [t in VegaTransactionType]: string } = {
  [VegaTransactionType.WITHDRAW]: t('Withdraw'),
  [VegaTransactionType.ORDER_SUBMISSION]: t('Order'),
  [VegaTransactionType.ORDER_CANCELLATION]: t('Cancel order'),
  [VegaTransactionType.ORDER_AMENDMENT]: t('Edit order'),
};

const determineVegaTransactionType = (
  tx: VegaStoredTxState
): VegaTransactionType | undefined => {
  if (isWithdrawTransaction(tx.body)) {
    return VegaTransactionType.WITHDRAW;
  }
  if (isOrderSubmissionTransaction(tx.body)) {
    return VegaTransactionType.ORDER_SUBMISSION;
  }
  if (isOrderCancellationTransaction(tx.body)) {
    return VegaTransactionType.ORDER_CANCELLATION;
  }
  if (isOrderAmendmentTransaction(tx.body)) {
    return VegaTransactionType.ORDER_AMENDMENT;
  }
  return;
};

const VegaTransactionDetails = ({ tx }: { tx: VegaStoredTxState }) => {
  const { data } = useAssetsDataProvider();
  if (!data) return null;

  const transactionType = determineVegaTransactionType(tx);

  if (transactionType === VegaTransactionType.WITHDRAW) {
    const transactionDetails = tx.body as WithdrawSubmissionBody;
    const asset = data?.find(
      (a) => a.id === transactionDetails.withdrawSubmission.asset
    );
    if (asset) {
      return (
        <TransactionDetails
          label={transactionLabels[VegaTransactionType.WITHDRAW]}
          amount={transactionDetails.withdrawSubmission.amount}
          asset={asset}
        />
      );
    }
  }

  if (
    tx.order &&
    (transactionType === VegaTransactionType.ORDER_SUBMISSION ||
      transactionType === VegaTransactionType.ORDER_CANCELLATION ||
      transactionType === VegaTransactionType.ORDER_AMENDMENT)
  ) {
    return (
      <OrderDetails
        label={transactionLabels[transactionType]}
        order={tx.order}
      />
    );
  }

  return null;
};

export const useVegaTransactionToasts = () => {
  const vegaTransactions = useVegaTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissVegaTransaction = useVegaTransactionStore(
    (state) => state.dismiss
  );
  const { createEthWithdrawalApproval } = useEthWithdrawApprovalsStore(
    (state) => ({
      createEthWithdrawalApproval: state.create,
    })
  );
  const explorerLink = useLinks(DApp.Explorer);

  const fromVegaTransaction = useCallback(
    (tx: VegaStoredTxState): Toast => {
      let toast: Partial<Toast> = {};
      const defaultValues = {
        id: `vega-${tx.id}`,
        intent: intentMap[tx.status],
        render: () => {
          return <span>{tx.txHash}</span>;
        },
        onClose: () => dismissVegaTransaction(tx.id),
      };
      if (tx.status === VegaTxStatus.Requested) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Action required')}</h3>
                <p>
                  {t(
                    'Please go to your Vega wallet application and approve or reject the transaction.'
                  )}
                </p>
                <VegaTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      if (tx.status === VegaTxStatus.Pending) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Awaiting confirmation')}</h3>
                <p>{t('Please wait for your transaction to be confirmed')}</p>
                {tx.txHash && (
                  <p className="break-all">
                    <ExternalLink
                      href={explorerLink(
                        EXPLORER_TX.replace(':hash', prepend0x(tx.txHash))
                      )}
                      rel="noreferrer"
                    >
                      {t('View in block explorer')}
                    </ExternalLink>
                  </p>
                )}
                <VegaTransactionDetails tx={tx} />
              </div>
            );
          },
          loader: true,
        };
      }
      if (tx.status === VegaTxStatus.Complete) {
        toast = {
          render: () => {
            if (isWithdrawTransaction(tx.body)) {
              const completeWithdrawalButton = tx.withdrawal && (
                <div className="mt-[10px]">
                  <Button
                    size="xs"
                    onClick={() => {
                      createEthWithdrawalApproval(
                        tx.withdrawal as WithdrawalBusEventFieldsFragment,
                        tx.withdrawalApproval
                      );
                    }}
                  >
                    {t('Complete withdrawal')}
                  </Button>
                </div>
              );
              return (
                <div>
                  <h3 className="font-bold">{t('Funds unlocked')}</h3>
                  <p>{t('Your funds have been unlocked for withdrawal')}</p>
                  {tx.txHash && (
                    <p className="break-all">
                      <ExternalLink
                        href={explorerLink(
                          EXPLORER_TX.replace(':hash', prepend0x(tx.txHash))
                        )}
                        rel="noreferrer"
                      >
                        {t('View in block explorer')}
                      </ExternalLink>
                    </p>
                  )}
                  <VegaTransactionDetails tx={tx} />
                  {completeWithdrawalButton}
                </div>
              );
            }

            return (
              <div>
                <h3 className="font-bold">{t('Confirmed')}</h3>
                <p>{t('Your transaction has been confirmed ')}</p>
                {tx.txHash && (
                  <p className="break-all">
                    <ExternalLink
                      href={explorerLink(
                        EXPLORER_TX.replace(':hash', prepend0x(tx.txHash))
                      )}
                      rel="noreferrer"
                    >
                      {t('View in block explorer')}
                    </ExternalLink>
                  </p>
                )}
                <VegaTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      if (tx.status === VegaTxStatus.Error) {
        toast = {
          render: () => {
            let label = t('Error occurred');
            let errorMessage = `${tx.error?.message}  ${
              tx.error?.data ? `:  ${tx.error?.data}` : ''
            }`;

            const orderRejection = tx.order && getRejectionReason(tx.order);
            if (orderRejection) {
              label = t('Order rejected');
              errorMessage = orderRejection;
            }

            return (
              <div>
                <h3 className="font-bold">{label}</h3>
                <p>{errorMessage}</p>
                <VegaTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      return {
        ...defaultValues,
        ...toast,
      };
    },
    [createEthWithdrawalApproval, dismissVegaTransaction, explorerLink]
  );

  const toasts = useMemo(() => {
    return [
      ...compact(vegaTransactions)
        .filter((tx) => determineVegaTransactionType(tx) !== undefined)
        .map(fromVegaTransaction),
    ];
  }, [fromVegaTransaction, vegaTransactions]);

  return toasts;
};
