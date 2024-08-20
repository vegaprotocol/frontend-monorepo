import type { Toast } from '@vegaprotocol/ui-toolkit';
import { Button, Intent, Panel, ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { useEffect } from 'react';
import { formatNumber, toBigNum } from '@vegaprotocol/utils';
import { useNavigate } from 'react-router-dom';
import {
  useEVMBridgeConfigs,
  useEthereumConfig,
  useWithdrawalApprovalQuery,
} from '@vegaprotocol/web3';
import { type WithdrawalFieldsFragment } from '@vegaprotocol/withdraws';
import { useT } from '../use-t';
import { Links } from '../links';
import { useChainId, useSwitchChain } from 'wagmi';
import { useEvmTx } from './use-evm-tx';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { useIncompleteWithdrawals } from './use-incomplete-withdrawals';

const CHECK_INTERVAL = 1000;
const ON_APP_START_TOAST_ID = `ready-to-withdraw`;

export const useReadyToWithdrawalToasts = () => {
  const [setToast, hasToast, updateToast, removeToast] = useToasts((store) => [
    store.setToast,
    store.hasToast,
    store.update,
    store.remove,
  ]);

  const { delayed, ready } = useIncompleteWithdrawals();

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
              <MultipleReadyToWithdrawToastContent count={ready.length} />
            ),
          onClose: () => updateToast(ON_APP_START_TOAST_ID, { hidden: true }),
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
  }, [delayed, hasToast, ready, removeToast, setToast, updateToast]);
};

const MultipleReadyToWithdrawToastContent = ({ count }: { count: number }) => {
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
          intent={Intent.Warning}
          data-testid="toast-view-withdrawals"
          size="xs"
          onClick={() => navigate(Links.PORTFOLIO())}
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

  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract } = useEvmTx();

  const { data } = useWithdrawalApprovalQuery({
    variables: {
      withdrawalId: withdrawal.id,
    },
  });

  const submitWithdrawAsset = async () => {
    if (!config || !configs) {
      throw new Error('could not fetch ethereum configs');
    }

    if (!data?.withdrawal) {
      throw new Error('no withdrawal');
    }

    if (!data.erc20WithdrawalApproval) {
      throw new Error('no withdrawal approval');
    }

    const asset = data.withdrawal.asset;

    if (asset.source.__typename !== 'ERC20') {
      throw new Error(
        `invalid asset type ${withdrawal.asset.source.__typename}`
      );
    }

    const cfg = [config, ...configs].find(
      // @ts-ignore asset is erc20 here
      (c) => c.chain_id === asset.source.chainId
    );

    if (!cfg) {
      throw new Error('could not find evm config for asset');
    }

    if (asset.source.chainId !== chainId.toString()) {
      await switchChainAsync({ chainId: Number(asset.source.chainId) });
    }

    writeContract({
      abi: BRIDGE_ABI,
      address: cfg.collateral_bridge_contract.address as `0x${string}`,
      functionName: 'withdraw_asset',
      args: [
        data.erc20WithdrawalApproval.assetSource,
        data.erc20WithdrawalApproval.amount,
        data.erc20WithdrawalApproval.targetAddress,
        data.erc20WithdrawalApproval.creation,
        data.erc20WithdrawalApproval.nonce,
        data.erc20WithdrawalApproval.signatures,
      ],
      chainId: Number(asset.source.chainId),
    });
  };

  const completeButton = (
    <p className="mt-2">
      <Button
        intent={Intent.Warning}
        data-testid="toast-complete-withdrawal"
        size="xs"
        onClick={submitWithdrawAsset}
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
