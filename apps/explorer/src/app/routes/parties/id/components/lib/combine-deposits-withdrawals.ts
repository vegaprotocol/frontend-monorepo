import {
  DepositStatusMapping,
  type DepositStatus,
  type WithdrawalStatus,
} from '@vegaprotocol/types';
import type { ExplorerPartyDepositsWithdrawalsQuery } from '../__generated__/Party-deposits-withdrawals';

export function combineDepositsWithdrawals(
  data: ExplorerPartyDepositsWithdrawalsQuery
) {
  const transfers =
    data?.partiesConnection?.edges?.flatMap((edge) => {
      return edge.node.depositsConnection?.edges?.map((depositEdge) => {
        return depositEdge?.node;
      });
    }) || [];

  const withdrawals =
    data?.partiesConnection?.edges?.flatMap((edge) => {
      return edge.node.withdrawalsConnection?.edges?.map((withdrawalEdge) => {
        return withdrawalEdge?.node;
      });
    }) || [];

  return [...transfers, ...withdrawals]
    .sort((a, b) => {
      return b?.createdTimestamp.localeCompare(a?.createdTimestamp);
    })
    .slice(0, 5);
}

export function isDepositStatus(
  status: DepositStatus | WithdrawalStatus
): status is DepositStatus {
  return status in DepositStatusMapping;
}
