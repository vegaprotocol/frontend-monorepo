import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as Schema from '@vegaprotocol/types';
import { ProtocolUpdateProposalDetailApprovals } from './protocol-update-proposal-detail-approvals';
import { getNormalisedVotingPower } from '../../../staking/shared';
import type { ProtocolUpdateProposalDetailApprovalsProps } from './protocol-update-proposal-detail-approvals';
import type { NodesFragmentFragment } from '../../../staking/home/__generated__/Nodes';

describe('ProtocolUpdateProposalDetailApprovals', () => {
  const mockValidators: NodesFragmentFragment[] = [
    {
      id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b4',
      name: 'Marvin',
      avatarUrl:
        'https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg',
      pubkey:
        '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b2917',
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
  ];

  const defaultProps = {
    totalConsensusValidators: 3,
    consensusApprovals: mockValidators,
    consensusApprovalsVotingPowerPercentage: '75%',
  };

  const renderComponent = (
    props: Partial<ProtocolUpdateProposalDetailApprovalsProps> = {}
  ) => {
    const mergedProps = {
      ...defaultProps,
      ...props,
    };
    return render(
      <BrowserRouter>
        <ProtocolUpdateProposalDetailApprovals {...mergedProps} />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(
      screen.getByTestId('protocol-upgrade-approval-status')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('protocol-upgrade-approvers')
    ).toBeInTheDocument();
  });

  it('renders the correct number of consensus approvers', () => {
    renderComponent();
    const validators = screen.getAllByTestId(/validator-name/);
    expect(validators.length).toBe(mockValidators.length);
  });

  it('renders the correct approval status with the required percentage', () => {
    renderComponent();
    expect(screen.getByText(/75% approval/i)).toBeInTheDocument();
    expect(screen.getByText(/67% voting power required/i)).toBeInTheDocument();
  });

  it('renders the correct voting power for each validator', () => {
    renderComponent();
    mockValidators.forEach((validator) => {
      const normalisedVotingPower = getNormalisedVotingPower(
        validator.rankingScore.votingPower,
        2
      );
      expect(screen.getByText(normalisedVotingPower)).toBeInTheDocument();
    });
  });
});
