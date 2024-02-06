import { type ProposalTermsFieldsFragment } from '../../__generated__/Proposals';
import { type Proposal, type BatchProposal } from '../../types';
import { ListAsset } from '../list-asset';
import { ProposalAssetDetails } from '../proposal-asset-details';
import { ProposalMarketChanges } from '../proposal-market-changes';
import { ProposalReferralProgramDetails } from '../proposal-referral-program-details';
import {
  ProposalCancelTransferDetails,
  ProposalTransferDetails,
} from '../proposal-transfer';
import { ProposalUpdateBenefitTiers } from '../proposal-update-benefit-tiers';
import { ProposalUpdateMarketState } from '../proposal-update-market-state';
import { ProposalVolumeDiscountProgramDetails } from '../proposal-volume-discount-program-details';

export const ProposalChangeDetails = ({
  proposal,
  terms,
  restData,
}: {
  proposal: Proposal | BatchProposal;
  terms: ProposalTermsFieldsFragment;
  // eslint-disable-next-line
  restData: any;
}) => {
  switch (terms.change.__typename) {
    case 'NewAsset': {
      if (proposal.id && terms.change.source.__typename === 'ERC20') {
        return (
          <div>
            <ListAsset
              assetId={proposal.id}
              withdrawalThreshold={terms.change.source.withdrawThreshold}
              lifetimeLimit={terms.change.source.lifetimeLimit}
            />
            <ProposalAssetDetails change={terms.change} assetId={proposal.id} />
          </div>
        );
      }
      return null;
    }
    case 'UpdateAsset': {
      if (proposal.id) {
        return (
          <ProposalAssetDetails
            change={terms.change}
            assetId={terms.change.assetId}
          />
        );
      }
      return null;
    }
    case 'NewMarket': {
      return <div>TODO: NewMarket</div>;
    }
    case 'UpdateMarket': {
      return (
        <ProposalMarketChanges
          marketId={terms.change.marketId}
          updatedProposal={
            restData?.data?.proposal?.terms?.updateMarket?.changes
          }
        />
      );

      return <div>TODO: UpdateAsset</div>;
    }
    case 'NewTransfer': {
      if (proposal.id) {
        return <ProposalTransferDetails proposalId={proposal.id} />;
      }
      return null;
    }
    case 'CancelTransfer': {
      if (proposal.id) {
        return <ProposalCancelTransferDetails proposalId={proposal.id} />;
      }
      return null;
    }
    case 'UpdateMarketState': {
      return <ProposalUpdateMarketState change={terms.change} />;
    }
    case 'UpdateReferralProgram': {
      return <ProposalReferralProgramDetails change={terms.change} />;
    }
    case 'UpdateVolumeDiscountProgram': {
      return <ProposalVolumeDiscountProgramDetails change={terms.change} />;
    }
    case 'UpdateNetworkParameter': {
      if (terms.change.networkParameter.key.slice(-13) === '.benefitTiers') {
        return <ProposalUpdateBenefitTiers change={terms.change} />;
      }

      return null;
    }
    case 'NewFreeform':
    case 'NewSpotMarket':
    case 'UpdateSpotMarket': {
      return null;
    }
    default: {
      return null;
    }
  }
};
