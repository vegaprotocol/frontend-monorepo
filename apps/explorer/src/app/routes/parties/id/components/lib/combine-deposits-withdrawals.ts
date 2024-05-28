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

  return [...transfers, ...withdrawals].sort((a, b) => {
    return a?.createdTimestamp.localeCompare(b?.createdTimestamp);
  });
}
