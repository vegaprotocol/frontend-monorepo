import { useMemo, useState } from 'react';
import compact from 'lodash/compact';

import {
  type DepositFieldsFragment,
  useDepositsQuery,
} from '@vegaprotocol/deposits';
import {
  type WithdrawalFieldsFragment,
  useWithdrawalsQuery,
} from '@vegaprotocol/withdraws';
import {
  type TransferFieldsFragment,
  useTransfersQuery,
} from '@vegaprotocol/accounts';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import type BigNumber from 'bignumber.js';

export interface RowBase {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  bAmount: BigNumber;
  createdTimestamp: Date;
}

export interface RowDeposit extends RowBase {
  type: 'Deposit';
  detail: DepositFieldsFragment;
}

export interface RowWithdrawal extends RowBase {
  type: 'Withdrawal';
  detail: WithdrawalFieldsFragment;
}

export interface RowTransfer extends RowBase {
  type: 'Transfer';
  detail: TransferFieldsFragment;
}

export type Row = RowDeposit | RowWithdrawal | RowTransfer;

export const PAGE_SIZE = 1000;

export const useAssetActivity = () => {
  const [first, setFirst] = useState(PAGE_SIZE);
  const { pubKey } = useVegaWallet();

  const variables = useMemo(() => {
    return { partyId: pubKey || '', pagination: { first } };
  }, [first, pubKey]);

  const { data: deposits, loading: depositsLoading } = useDepositsQuery({
    variables,
    skip: !pubKey,
  });
  const { data: withdrawals, loading: withdrawalsLoading } =
    useWithdrawalsQuery({
      variables,
      skip: !pubKey,
    });
  const { data: transfers, loading: transfersLoading } = useTransfersQuery({
    variables,
    skip: !pubKey,
  });

  const hasNextPage = [
    deposits?.party?.depositsConnection?.pageInfo?.hasNextPage,
    withdrawals?.party?.withdrawalsConnection?.pageInfo?.hasNextPage,
    transfers?.transfersConnection?.pageInfo?.hasNextPage,
  ].some((hasNextPage) => hasNextPage);

  const data = useMemo(() => {
    const items = [
      ...compact(deposits?.party?.depositsConnection?.edges || []).map(
        (edge) => edge?.node
      ),
      ...compact(withdrawals?.party?.withdrawalsConnection?.edges || []).map(
        (edge) => edge?.node
      ),
      ...compact(transfers?.transfersConnection?.edges || []).map(
        (edge) => edge?.node.transfer
      ),
    ].map(normalizeItem);

    return compact(items);
  }, [deposits, withdrawals, transfers]);

  return {
    data,
    loading: depositsLoading || withdrawalsLoading || transfersLoading,
    pageInfo: { hasNextPage },
    loadMore: () => {
      setFirst((curr) => curr + PAGE_SIZE);
    },
  };
};

function normalizeItem(
  item:
    | DepositFieldsFragment
    | WithdrawalFieldsFragment
    | TransferFieldsFragment
): Row | null {
  if (!item || !item.asset) return null;

  const bAmount = toBigNum(item.amount, item.asset.decimals);

  if (item.__typename === 'Withdrawal') {
    return {
      asset: item.asset,
      type: 'Withdrawal',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Deposit') {
    return {
      asset: item.asset,
      type: 'Deposit',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Transfer') {
    return {
      asset: item.asset,
      type: 'Transfer',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.timestamp),
      detail: item,
    };
  }

  return null;
}
