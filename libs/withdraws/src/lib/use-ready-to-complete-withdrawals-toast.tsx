import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  useVegaWallet,
  useWithdrawalApprovalQuery,
} from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Button, Intent, Panel, ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useMemo } from 'react';
import { t } from '@vegaprotocol/i18n';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { useNavigate } from 'react-router-dom';
import {
  useEthWithdrawApprovalsStore,
  useWithdrawDelay,
  useWithdrawThresholds,
} from '@vegaprotocol/web3';
import { withdrawalProvider } from './withdrawals-provider';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';

const TOAST_ID = `ready-to-withdraw`;
type UseReadyToWithdrawalToastsOptions = {
  withdrawalsLink: string;
};

export const useReadyToWithdrawalToasts = ({
  withdrawalsLink,
}: UseReadyToWithdrawalToastsOptions) => {
  const [setToast, hasToast, updateToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
  ]);

  const { pubKey, isReadOnly } = useVegaWallet();
  const { data } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || isReadOnly,
  });
  const delay = useWithdrawDelay(); // seconds
  const incompleteWithdrawals = useMemo(
    () => data?.filter((w) => !w.txHash),
    [data]
  );

  const assets = incompleteWithdrawals?.map((w) => w.asset);
  const thresholds = useWithdrawThresholds(assets);
  const readyToComplete = incompleteWithdrawals?.filter((w) => {
    const address =
      w.asset?.source.__typename === 'ERC20'
        ? w.asset.source.contractAddress
        : 'builtin';
    const threshold = thresholds[address];
    if (threshold && delay) {
      if (!new BigNumber(w.amount).isGreaterThan(threshold.value)) {
        // there's no delay time for withdrawals below the threshold
        return true;
      }
      const completeTimestamp =
        new Date(w.createdTimestamp).getTime() + delay * 1000;
      if (Date.now() >= completeTimestamp) {
        // after delay
        return true;
      }
    }
    return false;
  });

  const onClose = useCallback(() => {
    updateToast(TOAST_ID, { hidden: true });
  }, [updateToast]);

  useEffect(() => {
    if (!readyToComplete || readyToComplete?.length === 0) {
      return;
    }
    const toast: Toast = {
      id: TOAST_ID,
      intent: Intent.Warning,
      content:
        readyToComplete.length === 1 ? (
          <SingleReadyToWithdrawToastContent withdrawal={readyToComplete[0]} />
        ) : (
          <MultipleReadyToWithdrawToastContent
            count={readyToComplete.length}
            withdrawalsLink={withdrawalsLink}
          />
        ),
      onClose,
    };
    // set only once, unless removed
    if (!hasToast(TOAST_ID)) setToast(toast);
  }, [hasToast, onClose, readyToComplete, setToast, withdrawalsLink]);
};

const MultipleReadyToWithdrawToastContent = ({
  count,
  withdrawalsLink,
}: {
  count: number;
  withdrawalsLink?: string;
}) => {
  const navigate = useNavigate();
  return (
    <>
      <ToastHeading>{t('Withdrawals ready')}</ToastHeading>
      <p>
        {t(
          'Complete these %s withdrawals to release your funds',
          count.toString()
        )}
      </p>
      <p className="mt-1">
        <Button
          data-testid="toast-view-withdrawals"
          size="xs"
          onClick={() =>
            withdrawalsLink ? navigate(withdrawalsLink) : undefined
          }
        >
          {t('View withdrawals')}
        </Button>
      </p>
    </>
  );
};

const SingleReadyToWithdrawToastContent = ({
  withdrawal,
}: {
  withdrawal: WithdrawalFieldsFragment;
}) => {
  const { createEthWithdrawalApproval } = useEthWithdrawApprovalsStore(
    (state) => ({
      createEthWithdrawalApproval: state.create,
    })
  );

  const { data: approval } = useWithdrawalApprovalQuery({
    variables: {
      withdrawalId: withdrawal.id,
    },
  });
  const completeButton = (
    <p className="mt-1">
      <Button
        data-testid="toast-complete-withdrawal"
        size="xs"
        onClick={() => {
          createEthWithdrawalApproval(
            withdrawal,
            approval?.erc20WithdrawalApproval
          );
        }}
      >
        {t('Complete withdrawal')}
      </Button>
    </p>
  );
  const amount = formatNumber(
    toBigNum(withdrawal.amount, withdrawal.asset.decimals),
    withdrawal.asset.decimals
  );
  return (
    <>
      <ToastHeading>{t('Withdrawal ready')}</ToastHeading>
      <p>{t('Complete the withdrawal to release your funds')}</p>
      <Panel>
        <strong>
          {t('Withdraw')} {amount} {withdrawal.asset.symbol}
        </strong>
      </Panel>
      {completeButton}
    </>
  );
};
