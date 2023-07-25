import { render } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import {
  ProtocolUpgradeProposal,
  getConsensusApprovals,
  getConsensusApprovalsVotingPower,
  getConsensusApprovalsVotingPowerPercentage,
} from './protocol-upgrade-proposal';
import { ProtocolUpgradeProposalStatus } from '@vegaprotocol/types';
import { getNormalisedVotingPower } from '../../staking/shared';
import type { NodesFragmentFragment } from '../../staking/home/__generated__/Nodes';
import type { ProtocolUpgradeProposalFieldsFragment } from '@vegaprotocol/proposals';

const mockProposal: ProtocolUpgradeProposalFieldsFragment = {
  vegaReleaseTag: 'v0.1.234',
  status:
    ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING,
  upgradeBlockHeight: '12345',
  approvers: [],
};

const mockConsensusValidators: NodesFragmentFragment[] = [
  {
    id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b4',
    name: 'Marvin',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg',
    pubkey: '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b2917',
    stakedTotal: '14182454495731682635157',
    stakedByOperator: '1000000000000000000000',
    stakedByDelegates: '13182454495731682635157',
    pendingStake: '0',
    rankingScore: {
      rankingScore: '0.67845061012234727427532760837568',
      stakeScore: '0.3392701644525644',
      performanceScore: '0.9998677767864936',
      votingPower: '3500',
      status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
      __typename: 'RankingScore',
    },
    __typename: 'Node',
  },
  {
    id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b5',
    name: 'Barvin',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/Barvin-TV-3.jpg',
    pubkey: '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b291b',
    stakedTotal: '1418245449573168263',
    stakedByOperator: '100000000000000000',
    stakedByDelegates: '1318245449573168263',
    pendingStake: '0',
    rankingScore: {
      rankingScore: '0.5',
      stakeScore: '0.3',
      performanceScore: '0.98',
      votingPower: '2500',
      status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
      __typename: 'RankingScore',
    },
    __typename: 'Node',
  },
];

jest.mock('@vegaprotocol/environment', () => ({
  useVegaRelease: jest.fn(),
  useVegaReleases: jest.fn(),
}));

const renderComponent = () =>
  render(
    <ProtocolUpgradeProposal proposal={mockProposal} consensusValidators={[]} />
  );

describe('ProtocolUpgradeProposal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });
});

describe('getConsensusApprovals', () => {
  it('returns an empty array when there are no matching approvers', () => {
    const result = getConsensusApprovals(mockConsensusValidators, {
      ...mockProposal,
      approvers: [],
    });
    expect(result).toEqual([]);
  });

  it('returns the correct consensus approvals when there are matching approvers', () => {
    const expectedApprovals = mockConsensusValidators[1];

    const result = getConsensusApprovals(mockConsensusValidators, {
      ...mockProposal,
      approvers: [
        '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b291b',
      ],
    });

    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(expectedApprovals.id);
  });
});

describe('getConsensusApprovalsVotingPower', () => {
  it('returns 0 when the input array is empty', () => {
    const result = getConsensusApprovalsVotingPower([]);
    expect(result).toBe(0);
  });

  it('returns the correct sum of voting power for a given array of consensus validators', () => {
    const expectedSum = mockConsensusValidators.reduce(
      (acc, curr) => acc + Number(curr.rankingScore.votingPower),
      0
    );

    const result = getConsensusApprovalsVotingPower(mockConsensusValidators);
    expect(result).toBe(expectedSum);
  });
});

describe('getConsensusApprovalsVotingPowerPercentage', () => {
  it('returns "0%" when the input value is 0 or less', () => {
    const resultZero = getConsensusApprovalsVotingPowerPercentage(0);
    const resultNegative = getConsensusApprovalsVotingPowerPercentage(-10);
    expect(resultZero).toBe('0%');
    expect(resultNegative).toBe('0%');
  });

  it('returns the correct percentage string when the input value is greater than 0', () => {
    const inputValue = 12345;
    const expectedPercentage = getNormalisedVotingPower(
      inputValue.toString(),
      2
    );

    const result = getConsensusApprovalsVotingPowerPercentage(inputValue);
    expect(result).toBe(expectedPercentage);
  });
});
