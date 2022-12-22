import {
  Button,
  ExternalLink,
  Intent,
  ProgressBar,
  ToastsContainer,
} from '@vegaprotocol/ui-toolkit';
import { useCallback, useMemo } from 'react';
import {
  useEthTransactionStore,
  useEthWithdrawApprovalsStore,
  TransactionContent,
  EthTxStatus,
  isEthereumError,
  ApprovalStatus,
} from '@vegaprotocol/web3';
import {
  isWithdrawTransaction,
  useVegaTransactionStore,
  VegaTxStatus,
} from '@vegaprotocol/wallet';
import { VegaTransaction } from '../components/vega-transaction';
import { VerificationStatus } from '@vegaprotocol/withdraws';
import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';
import type {
  EthStoredTxState,
  EthWithdrawalApprovalState,
} from '@vegaprotocol/web3';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import type {
  VegaStoredTxState,
  WithdrawSubmissionBody,
  WithdrawalBusEventFieldsFragment,
} from '@vegaprotocol/wallet';
import type { Asset } from '@vegaprotocol/assets';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { formatNumber, t, toBigNum } from '@vegaprotocol/react-helpers';
import {
  DApp,
  ETHERSCAN_TX,
  EXPLORER_TX,
  useEtherscanLink,
  useLinks,
} from '@vegaprotocol/environment';
import { prepend0x } from '@vegaprotocol/smart-contracts';
import { useUpdateNetworkParametersToasts } from '@vegaprotocol/governance';

const intentMap = {
  Default: Intent.Primary,
  Requested: Intent.Warning,
  Pending: Intent.Warning,
  Error: Intent.Danger,
  Complete: Intent.Success,
  Confirmed: Intent.Success,
  Idle: Intent.None,
  Delayed: Intent.Warning,
  Ready: Intent.Success,
};

const TransactionDetails = ({
  label,
  amount,
  asset,
}: {
  label: string;
  amount: string;
  asset: Pick<Asset, 'symbol' | 'decimals'>;
}) => {
  const num = formatNumber(toBigNum(amount, asset.decimals), asset.decimals);
  return (
    <div className="mt-[5px]">
      <span className="font-mono text-xs p-1 bg-gray-100 rounded">
        {label} {num} {asset.symbol}
      </span>
    </div>
  );
};

const VegaTransactionDetails = ({ tx }: { tx: VegaStoredTxState }) => {
  const { data } = useAssetsDataProvider();
  if (!data) return null;

  const VEGA_WITHDRAW = isWithdrawTransaction(tx.body);
  if (VEGA_WITHDRAW) {
    const transactionDetails = tx.body as WithdrawSubmissionBody;
    const asset = data?.find(
      (a) => a.id === transactionDetails.withdrawSubmission.asset
    );
    if (asset) {
      return (
        <TransactionDetails
          label={t('Withdraw')}
          amount={transactionDetails.withdrawSubmission.amount}
          asset={asset}
        />
      );
    }
  }

  return null;
};

const EthTransactionDetails = ({ tx }: { tx: EthStoredTxState }) => {
  const { data } = useAssetsDataProvider();
  if (!data) return null;

  const ETH_WITHDRAW =
    tx.methodName === 'withdraw_asset' && tx.args.length > 2 && tx.asset;
  if (ETH_WITHDRAW) {
    const asset = data.find((a) => a.id === tx.asset);

    if (asset) {
      return (
        <>
          <TransactionDetails
            label={t('Withdraw')}
            amount={tx.args[1]}
            asset={asset}
          />
          {tx.requiresConfirmation && (
            <div className="mt-[10px]">
              <span className="font-mono text-xs">
                {t('Awaiting confirmations')}{' '}
                {`(${tx.confirmations}/${tx.requiredConfirmations})`}
              </span>
              <ProgressBar
                value={(tx.confirmations / tx.requiredConfirmations) * 100}
              />
            </div>
          )}
        </>
      );
    }
  }

  return null;
};

export const ToastsManager = () => {
  const updateNetworkParametersToasts = useUpdateNetworkParametersToasts();
  const vegaTransactions = useVegaTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissVegaTransaction = useVegaTransactionStore(
    (state) => state.dismiss
  );
  const ethTransactions = useEthTransactionStore((state) =>
    state.transactions.filter((transaction) => transaction?.dialogOpen)
  );
  const dismissEthTransaction = useEthTransactionStore(
    (state) => state.dismiss
  );
  const { withdrawApprovals, createEthWithdrawalApproval } =
    useEthWithdrawApprovalsStore((state) => ({
      withdrawApprovals: state.transactions.filter(
        (transaction) => transaction?.dialogOpen
      ),
      createEthWithdrawalApproval: state.create,
    }));
  const dismissWithdrawApproval = useEthWithdrawApprovalsStore(
    (state) => state.dismiss
  );
  const explorerLink = useLinks(DApp.Explorer);
  const etherscanLink = useEtherscanLink();

  const fromVegaTransaction = useCallback(
    (tx: VegaStoredTxState): Toast => {
      let toast: Partial<Toast> = {};
      const defaultValues = {
        id: `vega-${tx.id}`,
        intent: intentMap[tx.status],
        render: () => {
          return <VegaTransaction transaction={tx} />;
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
            const errorMessage = `${tx.error?.message}  ${
              tx.error?.data ? `:  ${tx.error?.data}` : ''
            }`;
            return (
              <div>
                <h3 className="font-bold">{t('Error occurred')}</h3>
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

  const fromEthTransaction = useCallback(
    (tx: EthStoredTxState): Toast => {
      let toast: Partial<Toast> = {};
      const defaultValues = {
        id: `eth-${tx.id}`,
        intent: intentMap[tx.status],
        render: () => {
          return <TransactionContent {...tx} />;
        },
        onClose: () => dismissEthTransaction(tx.id),
      };
      if (tx.status === EthTxStatus.Requested) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Action required')}</h3>
                <p>
                  {t(
                    'Please go to your wallet application and approve or reject the transaction.'
                  )}
                </p>
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      if (tx.status === EthTxStatus.Pending) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Awaiting confirmation')}</h3>
                <p>{t('Please wait for your transaction to be confirmed')}</p>
                {tx.txHash && (
                  <p className="break-all">
                    <ExternalLink
                      href={etherscanLink(
                        ETHERSCAN_TX.replace(':hash', tx.txHash)
                      )}
                      rel="noreferrer"
                    >
                      {t('View on Etherscan')}
                    </ExternalLink>
                  </p>
                )}
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
          loader: true,
        };
      }
      if (tx.status === EthTxStatus.Confirmed) {
        toast = {
          render: () => {
            return (
              <div>
                <h3 className="font-bold">{t('Transaction completed')}</h3>
                <p>{t('Your transaction has been completed')}</p>
                {tx.txHash && (
                  <p className="break-all">
                    <ExternalLink
                      href={etherscanLink(
                        ETHERSCAN_TX.replace(':hash', tx.txHash)
                      )}
                      rel="noreferrer"
                    >
                      {t('View on Etherscan')}
                    </ExternalLink>
                  </p>
                )}
                <EthTransactionDetails tx={tx} />
              </div>
            );
          },
        };
      }
      if (tx.status === EthTxStatus.Error) {
        toast = {
          render: () => {
            let errorMessage = '';

            if (isEthereumError(tx.error)) {
              errorMessage = tx.error.reason;
            } else if (tx.error instanceof Error) {
              errorMessage = tx.error.message;
            }
            return (
              <div>
                <h3 className="font-bold">{t('Error occurred')}</h3>
                <p>{errorMessage}</p>
                <EthTransactionDetails tx={tx} />
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
    [dismissEthTransaction, etherscanLink]
  );

  const fromWithdrawalApproval = useCallback(
    (tx: EthWithdrawalApprovalState): Toast => ({
      id: `withdrawal-${tx.id}`,
      intent: intentMap[tx.status],
      render: () => {
        let title = '';
        if (tx.status === ApprovalStatus.Error) {
          title = t('Error occurred');
        }
        if (tx.status === ApprovalStatus.Pending) {
          title = t('Pending approval');
        }
        if (tx.status === ApprovalStatus.Delayed) {
          title = t('Delayed');
        }
        return (
          <div>
            {title.length > 0 && <h3 className="font-bold">{title}</h3>}
            <VerificationStatus state={tx} />
            <TransactionDetails
              label={t('Withdraw')}
              amount={tx.withdrawal.amount}
              asset={tx.withdrawal.asset}
            />
          </div>
        );
      },
      onClose: () => dismissWithdrawApproval(tx.id),

      loader: tx.status === ApprovalStatus.Pending,
    }),
    [dismissWithdrawApproval]
  );

  const toasts = useMemo(() => {
    return sortBy(
      [
        ...compact(vegaTransactions).map(fromVegaTransaction),
        ...compact(ethTransactions).map(fromEthTransaction),
        ...compact(withdrawApprovals).map(fromWithdrawalApproval),
        ...updateNetworkParametersToasts,
      ],
      ['createdBy']
    );
  }, [
    vegaTransactions,
    fromVegaTransaction,
    ethTransactions,
    fromEthTransaction,
    withdrawApprovals,
    fromWithdrawalApproval,
    updateNetworkParametersToasts,
  ]);

  return <ToastsContainer order="desc" toasts={toasts} />;
};

export default ToastsManager;
