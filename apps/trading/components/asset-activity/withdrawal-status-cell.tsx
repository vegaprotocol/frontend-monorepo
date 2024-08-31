import { DAY, getDateTimeFormat, getTimeFormat } from '@vegaprotocol/utils';
import { WithdrawalStatus, WithdrawalStatusMapping } from '@vegaprotocol/types';
import {
  useEVMBridgeConfigs,
  useEthereumConfig,
  useWithdrawalApprovalQuery,
} from '@vegaprotocol/web3';

import { useT } from '../../lib/use-t';
import type { RowWithdrawal } from './use-asset-activity';
import { useEvmWithdraw } from '../../lib/hooks/use-evm-withdraw';
import { useAccount, useReadContract } from 'wagmi';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { useEffect, useRef, useState } from 'react';
import { useModal } from 'connectkit';
import {
  Button,
  Intent,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';

type Props = {
  data: RowWithdrawal;
  openDialog: (withdrawalId: string) => void;
};

export const WithdrawalStatusCell = ({ data, openDialog }: Props) => {
  if (
    data.detail.status !== WithdrawalStatus.STATUS_REJECTED &&
    !data.detail.txHash
  ) {
    return <WithdrawalStatusOpen data={data} openDialog={openDialog} />;
  }

  return <>{WithdrawalStatusMapping[data.detail.status]}</>;
};

const WithdrawalStatusOpen = ({ data, openDialog }: Props) => {
  const t = useT();
  const { status: ethWalletStatus } = useAccount();
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();
  const { submitWithdraw, data: txData } = useEvmWithdraw();
  const { data: approval } = useWithdrawalApprovalQuery({
    variables: {
      withdrawalId: data.detail.id,
    },
  });

  const handleComplete = () => {
    // The onConnect handler from useModal is called twice
    // so this is to make sure if a tx is already created we
    // dont immediately create another one
    if (txData?.hash) return;

    const asset = data.asset;

    if (!config || !configs) {
      throw new Error('could not fetch ethereum configs');
    }

    if (!approval?.erc20WithdrawalApproval) {
      throw new Error('no withdrawal approval');
    }

    if (asset?.source.__typename !== 'ERC20') {
      throw new Error(`invalid asset type ${asset?.source.__typename}`);
    }

    if (!cfg) {
      throw new Error(`could not find evm config for asset ${asset.id}`);
    }

    submitWithdraw({
      bridgeAddress: cfg.collateral_bridge_contract.address as `0x${string}`,
      approval: approval.erc20WithdrawalApproval,
      asset,
    });
  };

  const modal = useModal({
    onConnect: handleComplete,
  });

  const [status, setStatus] = useState<
    'idle' | 'delayed' | 'ready' | 'rejected'
  >(() => {
    if (data.detail.status === WithdrawalStatus.STATUS_REJECTED) {
      return 'rejected';
    }

    if (data.asset?.source.__typename === 'ERC20') {
      if (data.asset.source.withdrawThreshold === '0') {
        return 'ready';
      }
    }

    return 'idle';
  });

  const [readyAt, setReadyAt] = useState<Date>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // @ts-ignore configs is an array TODO: figure out type
  const cfg = [config, ...configs].find((c) => {
    if (data.asset?.source.__typename !== 'ERC20') return false;
    return c.chain_id === data.asset.source.chainId;
  });

  const { data: delay } = useReadContract({
    address: cfg.collateral_bridge_contract.address,
    abi: BRIDGE_ABI,
    functionName: 'default_withdraw_delay',
    chainId: Number(cfg.chain_id),
  });

  useEffect(() => {
    const checkStatus = () => {
      const hasThreshold =
        data.asset?.source.__typename === 'ERC20' &&
        data.asset?.source.withdrawThreshold !== '0';

      if (data.detail.status === WithdrawalStatus.STATUS_REJECTED) {
        setStatus('rejected');
        return;
      }

      if (hasThreshold && delay) {
        const readyTimestamp =
          new Date(data.detail.createdTimestamp).getTime() +
          (Number(delay) + 10) * 1000; // add a buffer
        const now = Date.now();

        setReadyAt(new Date(readyTimestamp));

        if (now < readyTimestamp) {
          setStatus('delayed');

          // Check again when delay time has passed
          timeoutRef.current = setTimeout(checkStatus, readyTimestamp - now);
        } else {
          setStatus('ready');
        }
      } else {
        setStatus('ready');
      }
    };

    checkStatus();

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [delay, data.asset, data.detail.createdTimestamp, data.detail.status]);

  if (status === 'idle') {
    return <>-</>;
  }

  if (status === 'delayed') {
    const showDate = readyAt && readyAt.getTime() > Date.now() + DAY;

    return (
      <>
        {t('Delayed')}:{' '}
        {showDate
          ? getDateTimeFormat().format(readyAt)
          : getTimeFormat().format(readyAt)}
      </>
    );
  }

  if (status === 'ready') {
    return (
      <span className="flex gap-1 items-center">
        <Button
          intent={Intent.Secondary}
          size="xs"
          onClick={() => {
            if (ethWalletStatus === 'disconnected') {
              modal.setOpen(true);
              return;
            }

            handleComplete();
          }}
        >
          {t('Complete')}
        </Button>
        <button
          onClick={() => openDialog(data.detail.id)}
          className="text-gs-100"
        >
          <VegaIcon name={VegaIconNames.INFO} className="mt-1" />
        </button>
      </span>
    );
  }

  return <>{WithdrawalStatusMapping[data.detail.status]}</>;
};
