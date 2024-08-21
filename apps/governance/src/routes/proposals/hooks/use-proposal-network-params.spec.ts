import { renderHook } from '@testing-library/react';
import { BigNumber } from '../../../lib/bignumber';
import { useProposalNetworkParams } from './use-proposal-network-params';

jest.mock('@vegaprotocol/network-parameters', () => ({
  ...jest.requireActual('@vegaprotocol/network-parameters'),
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
      governance_proposal_VolumeRebateProgram_requiredParticipation: '0.5',
      governance_proposal_VolumeRebateProgram_requiredMajority: '0.55',
    },
    loading: false,
    error: null,
  })),
}));

describe('use-proposal-network-params', () => {
  it('returns the correct params for an update market proposal', () => {
    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams());

    const expectedObj = {
      requiredMajority: expect.any(BigNumber),
      requiredMajorityLP: expect.any(BigNumber),
      requiredParticipation: expect.any(BigNumber),
      requiredParticipationLP: expect.any(BigNumber),
    };

    expect(current).toEqual({
      NewMarket: expectedObj,
      NewSpotMarket: expectedObj,
      UpdateMarket: expectedObj,
      UpdateMarketState: expectedObj,
      UpdateSpotMarket: expectedObj,
      UpdateNetworkParameter: expectedObj,
      NewAsset: expectedObj,
      UpdateAsset: expectedObj,
      NewFreeform: expectedObj,
      UpdateReferralProgram: expectedObj,
      UpdateVolumeDiscountProgram: expectedObj,
      NewTransfer: expectedObj,
      CancelTransfer: expectedObj,
      UpdateVolumeRebateProgram: expectedObj,
    });
  });

  it('returns the correct values for the proposal change type', () => {
    const {
      result: { current },
    } = renderHook(() => useProposalNetworkParams());

    expect(current?.UpdateMarket.requiredMajority.toString()).toEqual('0.1');
    expect(current?.UpdateMarket.requiredMajorityLP.toString()).toEqual('0.2');
    expect(current?.UpdateMarket.requiredParticipation.toString()).toEqual(
      '0.15'
    );
    expect(current?.UpdateMarket.requiredParticipationLP.toString()).toEqual(
      '0.25'
    );

    expect(current?.NewMarket.requiredMajority.toString()).toEqual('0.3');
    expect(current?.NewMarket.requiredMajorityLP.toString()).toEqual('0');
    expect(current?.NewMarket.requiredParticipation.toString()).toEqual('0.35');
    expect(current?.NewMarket.requiredParticipationLP.toString()).toEqual('0');

    expect(current?.NewAsset.requiredMajority.toString()).toEqual('0.4');
    expect(current?.NewAsset.requiredMajorityLP.toString()).toEqual('0');
    expect(current?.NewAsset.requiredParticipation.toString()).toEqual('0.45');
    expect(current?.NewAsset.requiredParticipationLP.toString()).toEqual('0');

    expect(current?.UpdateAsset.requiredMajority.toString()).toEqual('0.5');
    expect(current?.UpdateAsset.requiredMajorityLP.toString()).toEqual('0');
    expect(current?.UpdateAsset.requiredParticipation.toString()).toEqual(
      '0.55'
    );

    expect(current?.UpdateNetworkParameter.requiredMajority.toString()).toEqual(
      '0.6'
    );
    expect(
      current?.UpdateNetworkParameter.requiredMajorityLP.toString()
    ).toEqual('0');
    expect(
      current?.UpdateNetworkParameter.requiredParticipation.toString()
    ).toEqual('0.65');
    expect(
      current?.UpdateNetworkParameter.requiredParticipationLP.toString()
    ).toEqual('0');

    expect(current?.NewFreeform.requiredMajority.toString()).toEqual('0.7');
    expect(current?.NewFreeform.requiredMajorityLP.toString()).toEqual('0');
    expect(current?.NewFreeform.requiredParticipation.toString()).toEqual(
      '0.75'
    );
    expect(current?.NewFreeform.requiredParticipationLP.toString()).toEqual(
      '0'
    );
  });
});
