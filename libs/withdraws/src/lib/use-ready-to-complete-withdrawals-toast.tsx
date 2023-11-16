import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import BigNumber from 'bignumber.js';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Button, Intent, Panel, ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { useNavigate } from 'react-router-dom';
import {
  useEthWithdrawApprovalsStore,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
  useWithdrawalApprovalQuery,
} from '@vegaprotocol/web3';
import { withdrawalProvider } from './withdrawals-provider';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import uniqBy from 'lodash/uniqBy';
import { useT } from './use-t';

const CHECK_INTERVAL = 1000;
const ON_APP_START_TOAST_ID = `ready-to-withdraw`;
type UseReadyToWithdrawalToastsOptions = {
  withdrawalsLink: string;
};

export type TimestampedWithdrawals = {
  data: WithdrawalFieldsFragment;
  timestamp: number | undefined;
}[];

export const useIncompleteWithdrawals = () => {
  const [ready, setReady] = useState<TimestampedWithdrawals>([]);
  const [delayed, setDelayed] = useState<TimestampedWithdrawals>([]);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || isReadOnly,
  });
  const getDelay = useGetWithdrawDelay(); // seconds
  const incompleteWithdrawals = useMemo(
    () => data?.filter((w) => !w.txHash),
    [data]
  );

  const assets = useMemo(
    () =>
      uniqBy(
        incompleteWithdrawals?.map((w) => w.asset),
        (a) => a.id
      ),
    [incompleteWithdrawals]
  );

  const getThreshold = useGetWithdrawThreshold();

  const checkWithdraws = useCallback(async () => {
    if (assets.length === 0) return;
    // trigger delay
    // trigger thresholds
    return await Promise.all([
      getDelay(),
      ...assets.map((asset) => getThreshold(asset)),
    ]).then(([delay, ...thresholds]) => ({
      delay,
      thresholds: assets.reduce<Record<string, BigNumber | undefined>>(
        (all, asset, index) =>
          Object.assign(all, { [asset.id]: thresholds[index] }),
        {}
      ),
    }));
  }, [assets, getDelay, getThreshold]);

  useEffect(() => {
    checkWithdraws().then((retrieved) => {
      if (
        !retrieved ||
        retrieved.delay === undefined ||
        !incompleteWithdrawals
      ) {
        return;
      }
      const { thresholds, delay } = retrieved;
      const timestamped = incompleteWithdrawals.map((w) => {
        let timestamp = undefined;
        const threshold = thresholds[w.asset.id];
        if (threshold) {
          timestamp = 0;
          if (new BigNumber(w.amount).isGreaterThan(threshold)) {
            const created = w.createdTimestamp;
            timestamp = new Date(created).getTime() + (delay as number) * 1000;
          }
        }
        return {
          data: w,
          timestamp,
        };
      });
      const delayed = timestamped?.filter(
        (item) => item.timestamp != null && Date.now() < item.timestamp
      );

      const ready = timestamped?.filter(
        (item) => item.timestamp != null && Date.now() >= item.timestamp
      );

      setReady(ready);
      setDelayed(delayed);
    });
  }, [checkWithdraws, incompleteWithdrawals]);

  return { ready, delayed };
};

export const useReadyToWithdrawalToasts = ({
  withdrawalsLink,
}: UseReadyToWithdrawalToastsOptions) => {
  const [setToast, hasToast, updateToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
    store.remove,
  ]);

  const { delayed, ready } = useIncompleteWithdrawals();

  const onClose = useCallback(() => {
    // hides toast instead of removing is so it won't be re-added on rerender
    updateToast(ON_APP_START_TOAST_ID, { hidden: true });
  }, [updateToast]);

  useEffect(() => {
    // set on app start toast if there are withdrawals ready to complete
    if (ready.length > 0) {
      // set only once, unless removed
      if (!hasToast(ON_APP_START_TOAST_ID)) {
        const appStartToast: Toast = {
          id: ON_APP_START_TOAST_ID,
          intent: Intent.Warning,
          content:
            ready.length === 1 ? (
              <SingleReadyToWithdrawToastContent withdrawal={ready[0].data} />
            ) : (
              <MultipleReadyToWithdrawToastContent
                count={ready.length}
                withdrawalsLink={withdrawalsLink}
              />
            ),
          onClose,
        };
        setToast(appStartToast);
      }
    }

    // set toast whenever a withdrawal delay is passed
    let interval: NodeJS.Timer;
    if (delayed.length > 0) {
      interval = setInterval(() => {
        const ready = delayed.filter(
          (item) => item.timestamp && Date.now() >= item.timestamp
        );
        for (const withdrawal of ready) {
          const id = `complete-withdrawal-${withdrawal.data.id}`;
          const toast: Toast = {
            id,
            intent: Intent.Warning,
            content: (
              <SingleReadyToWithdrawToastContent withdrawal={withdrawal.data} />
            ),
            onClose: () => {
              updateToast(id, { hidden: true });
            },
          };
          if (!hasToast(id)) setToast(toast);
        }
      }, CHECK_INTERVAL);
    }

    return () => {
      clearInterval(interval);
    };
  }, [
    delayed,
    hasToast,
    onClose,
    ready,
    removeToast,
    setToast,
    updateToast,
    withdrawalsLink,
  ]);
};

const MultipleReadyToWithdrawToastContent = ({
  count,
  withdrawalsLink,
}: {
  count: number;
  withdrawalsLink?: string;
}) => {
  const t = useT();
  const navigate = useNavigate();
  return (
    <>
      <ToastHeading>{t('Withdrawals ready')}</ToastHeading>
      <p>
        {t('Complete these {{count}} withdrawals to release your funds', {
          count,
        })}
      </p>
      <p className="mt-2">
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
  const t = useT();
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
    <p className="mt-2">
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
          {t('Withdraw {{amount}} {{symbol}}', {
            amount,
            assetSymbol: withdrawal.asset.symbol,
          })}
        </strong>
      </Panel>
      {completeButton}
    </>
  );
};
