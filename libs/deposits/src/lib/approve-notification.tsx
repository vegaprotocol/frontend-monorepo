import { USDT_ID, type Asset } from '@vegaprotocol/assets';
import {
  BlockExplorerLink,
  Networks,
  getExternalChainLabel,
  useEnvironment,
} from '@vegaprotocol/environment';
import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import {
  formatNumber,
  getUnlimitedThreshold,
  quantumDecimalPlaces,
} from '@vegaprotocol/utils';
import type { EthStoredTxState } from '@vegaprotocol/web3';
import { EthTxStatus, useEthTransactionStore } from '@vegaprotocol/web3';
import BigNumber from 'bignumber.js';
import type { DepositBalances } from './use-deposit-balances';
import { useT } from './use-t';

interface ApproveNotificationProps {
  isActive: boolean;
  selectedAsset?: Asset;
  onApprove: (amount?: string) => void;
  approved: boolean;
  balances: DepositBalances | null | undefined;
  amount: string;
  approveTxId: number | null;
  intent?: Intent;
}

export const ApproveNotification = ({
  isActive,
  selectedAsset,
  onApprove,
  amount,
  balances,
  approved,
  approveTxId,
  intent = Intent.Warning,
}: ApproveNotificationProps) => {
  const { VEGA_ENV } = useEnvironment();
  const t = useT();
  const tx = useEthTransactionStore((state) => {
    return state.transactions.find((t) => t?.id === approveTxId);
  });

  if (!isActive) {
    return null;
  }

  if (!selectedAsset) {
    return null;
  }

  if (!balances) {
    return null;
  }

  const approvePrompt = (
    <div className="mb-4">
      <Notification
        intent={intent}
        testId="approve-default"
        message={t(
          'Before you can make a deposit of your chosen asset, {{assetSymbol}}, you need to approve its use in your Ethereum wallet',
          { assetSymbol: selectedAsset?.symbol }
        )}
        buttonProps={{
          size: 'sm',
          text: t('Approve {{assetSymbol}}', {
            assetSymbol: selectedAsset?.symbol,
          }),
          action: () => onApprove(),
          dataTestId: 'approve-submit',
        }}
      />
    </div>
  );

  let message = t('Approve again to deposit more than {{allowance}}', {
    allowance: formatNumber(balances.allowance.toString()),
  });
  const buttonProps = {
    size: 'sm' as const,
    text: t('Approve {{assetSymbol}}', {
      assetSymbol: selectedAsset?.symbol,
    }),
    action: () => onApprove(),
    dataTestId: 'reapprove-submit',
  };

  if (VEGA_ENV === Networks.MAINNET && selectedAsset.id === USDT_ID[VEGA_ENV]) {
    message = t(
      'USDT approved amount cannot be changed, only revoked. Revoke and reapprove to deposit more than {{allowance}}.',
      {
        allowance: formatNumber(balances.allowance.toString()),
      }
    );
    buttonProps.text = t('Revoke {{assetSymbol}} approval', {
      assetSymbol: selectedAsset?.symbol,
    });
    buttonProps.action = () => onApprove('0');
  }

  const reApprovePrompt = (
    <div className="mb-4">
      <Notification
        intent={intent}
        testId="reapprove-default"
        message={message}
        buttonProps={buttonProps}
      />
    </div>
  );
  const approvalFeedback = (
    <ApprovalTxFeedback
      tx={tx}
      selectedAsset={selectedAsset}
      allowance={balances.allowance}
    />
  );

  // always show requested and pending states
  if (
    tx &&
    [EthTxStatus.Requested, EthTxStatus.Pending, EthTxStatus.Complete].includes(
      tx.status
    )
  ) {
    return approvalFeedback;
  }

  if (!approved) {
    return approvePrompt;
  }

  if (new BigNumber(amount).isGreaterThan(balances.allowance)) {
    return reApprovePrompt;
  }

  if (
    tx &&
    tx.status === EthTxStatus.Error &&
    // @ts-ignore tx.error not typed correctly
    tx.error.code === 'ACTION_REJECTED'
  ) {
    return approvePrompt;
  }

  return approvalFeedback;
};

const ApprovalTxFeedback = ({
  tx,
  selectedAsset,
  allowance,
}: {
  tx: EthStoredTxState | undefined;
  selectedAsset: Asset;
  allowance?: BigNumber;
}) => {
  const t = useT();
  if (!tx) return null;

  const chainId =
    selectedAsset.source.__typename === 'ERC20'
      ? Number(selectedAsset.source.chainId)
      : undefined;

  const txLink = tx.txHash && (
    <BlockExplorerLink sourceChainId={chainId} tx={tx.txHash}>
      {t('View on {{chainLabel}}', {
        chainLabel: chainId
          ? getExternalChainLabel(chainId.toString())
          : 'block explorer',
      })}
    </BlockExplorerLink>
  );

  if (tx.status === EthTxStatus.Error) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Danger}
          testId="approve-error"
          message={
            <p>
              {t('Approval failed')} {txLink}
            </p>
          }
        />
      </div>
    );
  }

  if (tx.status === EthTxStatus.Requested) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Warning}
          testId="approve-requested"
          message={t(
            'Go to your Ethereum wallet and approve the transaction to enable the use of {{assetSymbol}}',
            { assetSymbol: selectedAsset?.symbol }
          )}
        />
      </div>
    );
  }

  if (tx.status === EthTxStatus.Pending) {
    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Primary}
          testId="approve-pending"
          message={
            <>
              <p>
                {t(
                  'Your {{assetSymbol}} approval is being confirmed by the Ethereum network. When this is complete, you can continue your deposit',
                  { assetSymbol: selectedAsset?.symbol }
                )}{' '}
              </p>
              {txLink && <p>{txLink}</p>}
            </>
          }
        />
      </div>
    );
  }

  if (tx.status === EthTxStatus.Confirmed) {
    const approvedAllowanceValue = (
      allowance || new BigNumber(0)
    ).isGreaterThan(getUnlimitedThreshold(selectedAsset.decimals))
      ? '∞'
      : formatNumber(
          allowance?.toString() || 0,
          quantumDecimalPlaces(selectedAsset.quantum, selectedAsset.decimals)
        );

    return (
      <div className="mb-4">
        <Notification
          intent={Intent.Success}
          testId="approve-confirmed"
          message={
            <>
              <p>
                {t(
                  'You approved deposits of up to {{assetSymbol}} {{approvedAllowanceValue}}.',
                  {
                    assetSymbol: selectedAsset?.symbol,
                    approvedAllowanceValue,
                  }
                )}
              </p>
              {txLink && <p>{txLink}</p>}
            </>
          }
        />
      </div>
    );
  }
  return null;
};
