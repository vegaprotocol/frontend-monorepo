import {
  DepositStatusMapping,
  type DepositStatus,
  type WithdrawalStatus,
} from '@vegaprotocol/types';
import type {
  ExplorerPartyDepositsWithdrawalsQuery,
  ExplorerPartyDepositFieldsFragment,
  ExplorerPartyWithdrawalFieldsFragment,
} from '../__generated__/PartyDepositsWithdrawals';

export type DepositOrWithdrawal =
  | ExplorerPartyDepositFieldsFragment
  | ExplorerPartyWithdrawalFieldsFragment
  | undefined;

/**
 * Deposits and Withdrawals are separate types in the array, but when rendering them we want both to appear
 * in the same list, in date order, and with only the properties we care about. This function does that.
 *
 * @param data GraphQL query result, presumably containing 0 or more deposits and 0 or more withdrawals
 * @param limit Integer (default 3)
 * @returns Array combined withdrawals and deposits, sorted and limited
 */
export function combineDepositsWithdrawals(
  data: ExplorerPartyDepositsWithdrawalsQuery,
  limit: number = 3
): DepositOrWithdrawal[] {
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

  // Combine deposits and withdrawals
  return (
    [...transfers, ...withdrawals]
      // Filter out null values
      .filter(Boolean)
      // Order by creation of the initial transaction
      .sort((a, b) => {
        return b?.createdTimestamp.localeCompare(a?.createdTimestamp);
      })
      // Limit to 3 by default (for the overview block), or the param limit
      .slice(0, limit)
  );
}

/**
 * Type narrowing for deposits/withdrawals, used only for labels. There are some
 * crossover statuses (FINALIZED, OPEN) but from a label point of view this is
 * adequate.
 *
 * @param status
 * @returns Boolean true if the provided object is a Deposit (i.e false is a Withdrawal)
 */
export function isDepositStatus(
  status: DepositStatus | WithdrawalStatus
): status is DepositStatus {
  return status in DepositStatusMapping;
}
