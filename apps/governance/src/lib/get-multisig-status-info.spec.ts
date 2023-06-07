import {
  getMultisigStatusInfo,
  MultisigStatus,
} from './get-multisig-status-info';
import type { PreviousEpochQuery } from '../routes/staking/__generated__/PreviousEpoch';

const createNode = (id: string, multisigScore: string) => ({
  node: {
    id,
    stakedTotal: '1000',
    rewardScore: { multisigScore },
  },
});

describe('getMultisigStatus', () => {
  it('should return MultisigStatus.noNodes when no nodes are present', () => {
    const result = getMultisigStatusInfo({
      epoch: { id: '1', validatorsConnection: { edges: [] } },
    } as PreviousEpochQuery);
    expect(result).toEqual({
      multisigStatus: MultisigStatus.noNodes,
      showMultisigStatusError: true,
    });
  });

  it('should return MultisigStatus.correct when all nodes have multisigScore of 1', () => {
    const result = getMultisigStatusInfo({
      epoch: {
        id: '1',
        validatorsConnection: {
          edges: [createNode('1', '1'), createNode('2', '1')],
        },
      },
    } as PreviousEpochQuery);
    expect(result).toEqual({
      multisigStatus: MultisigStatus.correct,
      showMultisigStatusError: false,
    });
  });

  it('should return MultisigStatus.nodeNeedsRemoving when all nodes have multisigScore of 0', () => {
    const result = getMultisigStatusInfo({
      epoch: {
        id: '1',
        validatorsConnection: {
          edges: [createNode('1', '0'), createNode('2', '0')],
        },
      },
    } as PreviousEpochQuery);
    expect(result).toEqual({
      multisigStatus: MultisigStatus.nodeNeedsRemoving,
      showMultisigStatusError: true,
    });
  });

  it('should return MultisigStatus.nodeNeedsAdding when some nodes have multisigScore of 0 and others have 1', () => {
    const result = getMultisigStatusInfo({
      epoch: {
        id: '1',
        validatorsConnection: {
          edges: [createNode('1', '0'), createNode('2', '1')],
        },
      },
    } as PreviousEpochQuery);
    expect(result).toEqual({
      multisigStatus: MultisigStatus.nodeNeedsAdding,
      showMultisigStatusError: true,
    });
  });
});
