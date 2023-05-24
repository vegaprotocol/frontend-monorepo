import { removePaginationWrapper } from '@vegaprotocol/utils';
import type { PreviousEpochQuery } from '../routes/staking/__generated__/PreviousEpoch';

export enum MultisigStatus {
  'correct',
  'nodeNeedsAdding',
  'nodeNeedsRemoving',
  'noNodes',
}

export const getMultisigStatus = (previousEpochData: PreviousEpochQuery) => {
  const allNodesInPreviousEpoch = removePaginationWrapper(
    previousEpochData?.epoch.validatorsConnection?.edges
  );

  if (allNodesInPreviousEpoch.length === 0) {
    return MultisigStatus.noNodes;
  }

  const hasZero = allNodesInPreviousEpoch.some(
    (node) => Number(node?.rewardScore?.multisigScore) === 0
  );
  const hasOne = allNodesInPreviousEpoch.some(
    (node) => Number(node?.rewardScore?.multisigScore) === 1
  );

  // If any individual node has 0 it means that node is missing from the multisig and needs to be added
  if (hasZero && hasOne) return MultisigStatus.nodeNeedsAdding;
  // If all nodes have 0 it means there is an incorrect address in the multisig that needs to be removed
  if (hasZero) return MultisigStatus.nodeNeedsRemoving;
  return MultisigStatus.correct;
};
