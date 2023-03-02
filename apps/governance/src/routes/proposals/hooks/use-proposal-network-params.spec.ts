import { renderHook } from '@testing-library/react';
import { BigNumber } from '../../../lib/bignumber';
import { useProposalNetworkParams } from './use-proposal-network-params';
import { generateProposal } from '../test-helpers/generate-proposals';

jest.mock('@vegaprotocol/react-helpers', () => ({
  ...jest.requireActual('@vegaprotocol/react-helpers'),
  useNetworkParams: jest.fn(() => ({
    params: {
      governance_proposal_updateMarket_requiredMajority: '0.1',
      governance_proposal_updateMarket_requiredParticipation: '0.15',
      governance_proposal_updateMarket_requiredMajorityLP: '0.2',
      governance_proposal_updateMarket_requiredParticipationLP: '0.25',
      governance_proposal_market_requiredMajority: '0.3',
      governance_proposal_market_requiredParticipation: '0.35',
      governance_proposal_asset_requiredMajority: '0.4',
      governance_proposal_asset_requiredParticipation: '0.45',
      governance_proposal_updateAsset_requiredMajority: '0.5',
      governance_proposal_updateAsset_requiredParticipation: '0.55',
      governance_proposal_updateNetParam_requiredMajority: '0.6',
      governance_proposal_updateNetParam_requiredParticipation: '0.65',
      governance_proposal_freeform_requiredMajority: '0.7',
      governance_proposal_freeform_requiredParticipation: '0.75',
    },
    loading: false,
    error: null,
  })),
}));

describe('use-proposal-network-params', () => {
  it('returns the correct params for an update market proposal', () => {
    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateMarket',
        },
      },
    });

    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams({ proposal }));

    expect(current).toEqual({
      requiredMajority: '0.1',
      requiredMajorityLP: '0.2',
      requiredParticipation: new BigNumber(0.15),
      requiredParticipationLP: new BigNumber(0.25),
    });
  });

  it('returns the correct params for a market proposal', () => {
    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'NewMarket',
        },
      },
    });

    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams({ proposal }));

    expect(current).toEqual({
      requiredMajority: '0.3',
      requiredParticipation: new BigNumber(0.35),
    });
  });

  it('returns the correct params for an asset proposal', () => {
    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'NewAsset',
        },
      },
    });

    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams({ proposal }));

    expect(current).toEqual({
      requiredMajority: '0.4',
      requiredParticipation: new BigNumber(0.45),
    });
  });

  it('returns the correct params for an update asset proposal', () => {
    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateAsset',
        },
      },
    });

    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams({ proposal }));

    expect(current).toEqual({
      requiredMajority: '0.5',
      requiredParticipation: new BigNumber(0.55),
    });
  });

  it('returns the correct params for a network params proposal', () => {
    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateNetworkParameter',
        },
      },
    });

    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams({ proposal }));

    expect(current).toEqual({
      requiredMajority: '0.6',
      requiredParticipation: new BigNumber(0.65),
    });
  });

  it('returns the correct params for a freeform proposal', () => {
    const proposal = generateProposal({
      terms: {
        change: {
          __typename: 'NewFreeform',
        },
      },
    });

    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams({ proposal }));

    expect(current).toEqual({
      requiredMajority: '0.7',
      requiredParticipation: new BigNumber(0.75),
    });
  });
});
