import { renderHook } from '@testing-library/react';
import { BigNumber } from '../../../lib/bignumber';
import { useVoteInformation } from './use-vote-information';
import {
  generateProposal,
  generateYesVotes,
  generateNoVotes,
} from '../test-helpers/generate-proposals';
import type { AppState } from '../../../contexts/app-state/app-state-context';

const mockTotalSupply = new BigNumber(100);

const mockAppState: AppState = {
  totalAssociated: new BigNumber('50063005'),
  decimals: 18,
  totalSupply: mockTotalSupply,
  vegaWalletManageOverlay: false,
  transactionOverlay: false,
  bannerMessage: '',
  disconnectNotice: false,
};

jest.mock('../../../contexts/app-state/app-state-context', () => ({
  useAppState: () => ({
    appState: mockAppState,
  }),
}));

jest.mock('@vegaprotocol/network-parameters', () => ({
  ...jest.requireActual('@vegaprotocol/network-parameters'),
  useNetworkParams: jest.fn(() => ({
    params: {
      governance_proposal_updateMarket_requiredMajority: '0.5',
      governance_proposal_updateMarket_requiredMajorityLP: '0.5',
      governance_proposal_updateMarket_requiredParticipation: '0.5',
      governance_proposal_updateMarket_requiredParticipationLP: '0.5',
      governance_proposal_market_requiredMajority: '0.5',
      governance_proposal_market_requiredParticipation: '0.5',
      governance_proposal_asset_requiredMajority: '0.5',
      governance_proposal_asset_requiredParticipation: '0.5',
      governance_proposal_updateAsset_requiredMajority: '0.5',
      governance_proposal_updateAsset_requiredParticipation: '0.5',
      governance_proposal_updateNetParam_requiredMajority: '0.5',
      governance_proposal_updateNetParam_requiredParticipation: '0.5',
      governance_proposal_freeform_requiredMajority: '0.5',
      governance_proposal_freeform_requiredParticipation: '0.5',
    },
    loading: false,
    error: null,
  })),
}));

describe('use-vote-information', () => {
  it('returns all required vote information', () => {
    const yesVotes = 40;
    const noVotes = 60;
    const yesEquityLikeShareWeight = '0.30';
    const noEquityLikeShareWeight = '0.70';
    // Note - giving a fixedTokenValue of 1 means a ratio of 1:1 votes to tokens, making sums easier :)
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateMarket',
          marketId: '12345',
        },
      },
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(
          yesVotes,
          fixedTokenValue,
          yesEquityLikeShareWeight
        ),
        no: generateNoVotes(noVotes, fixedTokenValue, noEquityLikeShareWeight),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.requiredMajorityPercentage).toEqual(new BigNumber(50));
    expect(current.requiredMajorityLPPercentage).toEqual(new BigNumber(50));
    expect(current.noTokens).toEqual(new BigNumber(60));
    expect(current.noVotes).toEqual(new BigNumber(60));
    expect(current.noEquityLikeShareWeight).toEqual(new BigNumber(70));
    expect(current.yesTokens).toEqual(new BigNumber(40));
    expect(current.yesVotes).toEqual(new BigNumber(40));
    expect(current.yesEquityLikeShareWeight).toEqual(new BigNumber(30));
    expect(current.totalTokensVoted).toEqual(new BigNumber(100));
    expect(current.totalVotes).toEqual(new BigNumber(100));
    expect(current.totalEquityLikeShareWeight).toEqual(new BigNumber(100));
    expect(current.yesPercentage).toEqual(new BigNumber(40));
    expect(current.yesLPPercentage).toEqual(new BigNumber(30));
    expect(current.noPercentage).toEqual(new BigNumber(60));
    expect(current.noLPPercentage).toEqual(new BigNumber(70));
    expect(current.requiredParticipation).toEqual(new BigNumber(50));
    expect(current.participationMet).toEqual(true);
    expect(current.requiredParticipationLP).toEqual(new BigNumber(50));
    expect(current.participationLPMet).toEqual(true);
    expect(current.majorityMet).toEqual(false);
    expect(current.majorityLPMet).toEqual(false);
    expect(current.totalTokensPercentage).toEqual(new BigNumber(100));
    expect(current.totalLPTokensPercentage).toEqual(new BigNumber(100));
    expect(current.willPassByTokenVote).toEqual(false);
    expect(current.willPassByLPVote).toEqual(false);
  });

  it('correctly returns majority, participation and will-pass status for a proposal with no votes', () => {
    const yesVotes = 0;
    const noVotes = 0;
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(yesVotes, fixedTokenValue),
        no: generateNoVotes(noVotes, fixedTokenValue),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.participationMet).toEqual(false);
    expect(current.majorityMet).toEqual(false);
    expect(current.willPassByTokenVote).toEqual(false);
  });

  it('correctly shows lack of participation for a failing proposal lacking votes', () => {
    const yesVotes = 20;
    const noVotes = 10;
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(yesVotes, fixedTokenValue),
        no: generateNoVotes(noVotes, fixedTokenValue),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.participationMet).toEqual(false);
  });

  it('correctly shows participation but lack of majority for a failing proposal with enough votes but not enough majority', () => {
    const yesVotes = 20;
    const noVotes = 70;
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(yesVotes, fixedTokenValue),
        no: generateNoVotes(noVotes, fixedTokenValue),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.participationMet).toEqual(true);
    expect(current.majorityMet).toEqual(false);
    expect(current.willPassByTokenVote).toEqual(false);
  });

  it('correctly shows participation, majority and will-pass data for successful proposal', () => {
    const yesVotes = 70;
    const noVotes = 20;
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(yesVotes, fixedTokenValue),
        no: generateNoVotes(noVotes, fixedTokenValue),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.participationMet).toEqual(true);
    expect(current.majorityMet).toEqual(true);
    expect(current.willPassByTokenVote).toEqual(true);
  });

  it('correctly shows whether an update market proposal will pass by token or LP vote - both failing', () => {
    const yesVotes = 0.2;
    const noVotes = 0.7;
    const yesEquityLikeShareWeight = '0.30';
    const noEquityLikeShareWeight = '0.60';
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateMarket',
          marketId: '12345',
        },
      },
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(
          yesVotes,
          fixedTokenValue,
          yesEquityLikeShareWeight
        ),
        no: generateNoVotes(noVotes, fixedTokenValue, noEquityLikeShareWeight),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.willPassByTokenVote).toEqual(false);
    expect(current.willPassByLPVote).toEqual(false);
  });

  it('correctly shows whether an update market proposal failing token but passing LP voting', () => {
    const yesVotes = 0;
    const noVotes = 70;
    const yesEquityLikeShareWeight = '80';
    const noEquityLikeShareWeight = '20';
    const fixedTokenValue = 1000000000000000000;

    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateMarket',
          marketId: '12345',
        },
      },
      votes: {
        __typename: 'ProposalVotes',
        yes: generateYesVotes(
          yesVotes,
          fixedTokenValue,
          yesEquityLikeShareWeight
        ),
        no: generateNoVotes(noVotes, fixedTokenValue, noEquityLikeShareWeight),
      },
    });

    const {
      result: { current },
    } = renderHook(() => useVoteInformation({ proposal }));

    expect(current.willPassByTokenVote).toEqual(false);
    expect(current.willPassByLPVote).toEqual(true);
  });
});
