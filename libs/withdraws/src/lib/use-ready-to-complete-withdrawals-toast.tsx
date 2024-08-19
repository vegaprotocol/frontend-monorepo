import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import BigNumber from 'bignumber.js';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Button, Intent, Panel, ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { useNavigate } from 'react-router-dom';
import {
  toAssetData,
  useEthWithdrawApprovalsStore,
  useGetWithdrawDelay,
  useGetWithdrawThreshold,
  useWithdrawalApprovalQuery,
} from '@vegaprotocol/web3';
import { withdrawalProvider } from './withdrawals-provider';
import type { WithdrawalFieldsFragment } from './__generated__/Withdrawal';
import uniqBy from 'lodash/uniqBy';
import { useT } from './use-t';
import uniq from 'lodash/uniq';
import compact from 'lodash/compact';
import { useWeb3React } from '@web3-react/core';

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

    const chainIds = uniq(
      compact(
        assets.map((a) =>
          a.source.__typename === 'ERC20' ? Number(a.source.chainId) : null
        )
      )
    );

    const delays = await Promise.all(
      chainIds.map((chainId) => getDelay(chainId))
    ).then((delays) =>
      chainIds.reduce<Record<number, number | undefined>>(
        (all, chainId, index) =>
          Object.assign(all, { [chainId]: delays[index] }),
        {}
      )
    );

    const thresholds = await Promise.all(
      assets.map((asset) => getThreshold(toAssetData(asset)))
    ).then((thresholds) =>
      assets.reduce<Record<string, BigNumber | undefined>>(
        (all, asset, index) =>
          Object.assign(all, { [asset.id]: thresholds[index] }),
        {}
      )
    );

    return { delays, thresholds };
  }, [assets, getDelay, getThreshold]);

  useEffect(() => {
    checkWithdraws().then((retrieved) => {
      if (
        !retrieved ||
        Object.keys(retrieved.delays).length === 0 ||
        !incompleteWithdrawals
      ) {
        return;
      }
      const { thresholds, delays } = retrieved;
      const timestamped = incompleteWithdrawals.map((w) => {
        let timestamp = undefined;
        const assetChainId =
          w.asset.source.__typename === 'ERC20'
            ? Number(w.asset.source.chainId)
            : undefined;
        const threshold = thresholds[w.asset.id];
        if (threshold && assetChainId && delays[assetChainId] != null) {
          const delay = delays[assetChainId];
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
        {t(
          'completeWithdrawals',
          'Complete these {{count}} withdrawals to release your funds',
          {
            count,
          }
        )}
      </p>
      <p className="mt-2">
        <Button
          intent={Intent.Warning}
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
  const { connector, chainId } = useWeb3React();
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
        intent={Intent.Warning}
        data-testid="toast-complete-withdrawal"
        size="xs"
        onClick={async () => {
          const asset = withdrawal.asset;
          if (
            asset.source.__typename === 'ERC20' &&
            asset.source.chainId !== String(chainId)
          ) {
            await connector.provider?.request({
              method: 'wallet_switchEthereumChain',
              params: [
                {
                  chainId: `0x${Number(asset.source.chainId).toString(16)}`,
                },
              ],
            });
          }

          // without this timeout the the complete tx does not trigger, dont know why
          setTimeout(() => {
            createEthWithdrawalApproval(
              withdrawal,
              approval?.erc20WithdrawalApproval
            );
          }, 300);
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
            symbol: withdrawal.asset.symbol,
          })}
        </strong>
      </Panel>
      {completeButton}
    </>
  );
};
