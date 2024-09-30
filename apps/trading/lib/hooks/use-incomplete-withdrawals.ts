import compact from 'lodash/compact';
import { useReadContracts } from 'wagmi';
import { type Abi } from 'viem';
import BigNumber from 'bignumber.js';

import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEVMBridgeConfigs, useEthereumConfig } from '@vegaprotocol/web3';
import {
  type WithdrawalFieldsFragment,
  withdrawalProvider,
} from '@vegaprotocol/withdraws';
import { BRIDGE_ABI } from '@vegaprotocol/smart-contracts';
import { WithdrawalStatus } from '@vegaprotocol/types';

export type TimestampedWithdrawals = {
  data: WithdrawalFieldsFragment;
  timestamp: number | undefined;
}[];

export const useIncompleteWithdrawals = () => {
  const { config } = useEthereumConfig();
  const { configs } = useEVMBridgeConfigs();

  const allConfigs = [config, ...(configs || [])];

  const contracts = compact(
    allConfigs.map((c) => {
      if (!c) return null;

      return {
        abi: BRIDGE_ABI as Abi,
        address: c.collateral_bridge_contract.address as `0x${string}`,
        functionName: 'default_withdraw_delay',
        chainId: Number(c.chain_id),
      };
    })
  );

  const { data: delaysData } = useReadContracts({
    contracts,
  });

  const delays = new Map<number, bigint>();

  delaysData?.forEach((res, i) => {
    // @ts-ignore result is bigint
    delays.set(contracts[i].chainId, res.result);
  });

  const { pubKey, isReadOnly } = useVegaWallet();

  const { data } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey || isReadOnly,
  });

  return getReadyAndDelayed(data || [], delays);
};

export const getReadyAndDelayed = (
  withdrawals: WithdrawalFieldsFragment[],
  delays: Map<number, bigint>
) => {
  const incompleteWithdrawals = withdrawals?.filter((w) => {
    if (w.status === WithdrawalStatus.STATUS_REJECTED) return false;
    if (w.status === WithdrawalStatus.STATUS_FINALIZED) return false;
    if (w.txHash) return false;
    return true;
  });

  const timestamped = incompleteWithdrawals?.map((w) => {
    let timestamp = undefined;

    const assetChainId =
      w.asset.source.__typename === 'ERC20'
        ? Number(w.asset.source.chainId)
        : undefined;

    const threshold =
      w.asset.source.__typename === 'ERC20'
        ? w.asset.source.withdrawThreshold
        : undefined;

    const delay = assetChainId ? delays.get(assetChainId) : undefined;

    if (threshold && assetChainId && delay) {
      timestamp = 0;
      if (new BigNumber(w.amount).isGreaterThan(threshold)) {
        const created = w.createdTimestamp;
        timestamp = new Date(created).getTime() + Number(delay) * 1000;
      }
    }
    return {
      data: w,
      timestamp,
    };
  });

  const delayed =
    timestamped?.filter(
      (item) => item.timestamp != null && Date.now() < item.timestamp
    ) || [];

  const ready =
    timestamped?.filter(
      (item) => item.timestamp != null && Date.now() >= item.timestamp
    ) || [];

  return {
    ready,
    delayed,
  };
};
