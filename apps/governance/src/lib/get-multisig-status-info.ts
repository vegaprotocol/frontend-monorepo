import { removePaginationWrapper } from '@vegaprotocol/utils';
import type { PreviousEpochQuery } from '../routes/staking/__generated__/PreviousEpoch';

export enum MultisigStatus {
  'correct' = 'correct',
  'nodeNeedsAdding' = 'nodeNeedsAdding',
  'nodeNeedsRemoving' = 'nodeNeedsRemoving ',
  'noNodes' = 'noNodes',
}

export const getMultisigStatusInfo = (
  previousEpochData: PreviousEpochQuery
) => {
  let status = MultisigStatus.noNodes;

  const allNodesInPreviousEpoch = removePaginationWrapper(
    previousEpochData?.epoch.validatorsConnection?.edges
  );

  const hasZero = allNodesInPreviousEpoch.some(
    (node) => Number(node?.rewardScore?.multisigScore) === 0
  );
  const hasOne = allNodesInPreviousEpoch.some(
    (node) => Number(node?.rewardScore?.multisigScore) === 1
  );

  if (hasZero && hasOne) {
    // If any individual node has 0 it means that node is missing from the multisig and needs to be added
    status = MultisigStatus.nodeNeedsAdding;
  } else if (hasZero) {
    // If all nodes have 0 it means there is an incorrect address in the multisig that needs to be removed
    status = MultisigStatus.nodeNeedsRemoving;
  } else if (allNodesInPreviousEpoch.length > 0) {
    // If all nodes have 1 it means the multisig is correct
    status = MultisigStatus.correct;
  }

  return {
    showMultisigStatusError: status !== MultisigStatus.correct,
    multisigStatus: status,
  };
};
