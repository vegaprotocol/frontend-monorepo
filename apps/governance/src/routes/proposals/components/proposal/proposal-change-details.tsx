import { type ProposalTermsFieldsFragment } from '../../__generated__/Proposals';
import { type Proposal, type BatchProposal } from '../../types';
import { ListAsset } from '../list-asset';
import { ProposalAssetDetails } from '../proposal-asset-details';
import { ProposalMarketChanges } from '../proposal-market-changes';
import { ProposalMarketData } from '../proposal-market-data';
import { ProposalReferralProgramDetails } from '../proposal-referral-program-details';
import {
  ProposalCancelTransferDetails,
  ProposalTransferDetails,
} from '../proposal-transfer';
import { ProposalUpdateBenefitTiers } from '../proposal-update-benefit-tiers';
import { ProposalUpdateMarketState } from '../proposal-update-market-state';
import { ProposalVolumeDiscountProgramDetails } from '../proposal-volume-discount-program-details';
import { getIndicatorStyle } from './colours';
import { type ProposalNode } from './proposal-utils';

export const ProposalChangeDetails = ({
  proposal,
  terms,
  restData,
  indicator,
}: {
  proposal: Proposal | BatchProposal;
  terms: ProposalTermsFieldsFragment;
  restData: ProposalNode | null;
  indicator?: number;
}) => {
  let details = null;

  switch (terms.change.__typename) {
    case 'NewAsset': {
      if (proposal.id && terms.change.source.__typename === 'ERC20') {
        details = (
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
      break;
    }
    case 'UpdateAsset': {
      if (proposal.id) {
        details = (
          <ProposalAssetDetails
            change={terms.change}
            assetId={terms.change.assetId}
          />
        );
      }
      break;
    }
    case 'NewMarket': {
      if (proposal.id) {
        details = <ProposalMarketData proposalId={proposal.id} />;
      }
      break;
    }
    case 'UpdateMarket': {
      if (proposal.id) {
        details = (
          <div className="flex flex-col gap-4">
            <ProposalMarketData proposalId={proposal.id} />
            <ProposalMarketChanges
              indicator={indicator}
              marketId={terms.change.marketId}
              updateProposalNode={restData}
            />
          </div>
        );
      }

      break;
    }
    case 'NewTransfer': {
      if (proposal.id) {
        details = <ProposalTransferDetails proposalId={proposal.id} />;
      }
      break;
    }
    case 'CancelTransfer': {
      if (proposal.id) {
        details = <ProposalCancelTransferDetails proposalId={proposal.id} />;
      }
      break;
    }
    case 'UpdateMarketState': {
      details = <ProposalUpdateMarketState change={terms.change} />;
      break;
    }
    case 'UpdateReferralProgram': {
      details = <ProposalReferralProgramDetails change={terms.change} />;
      break;
    }
    case 'UpdateVolumeDiscountProgram': {
      details = <ProposalVolumeDiscountProgramDetails change={terms.change} />;
      break;
    }
    case 'UpdateNetworkParameter': {
      if (
        terms.change.networkParameter.key === 'rewards.vesting.benefitTiers' ||
        terms.change.networkParameter.key ===
          'rewards.activityStreak.benefitTiers'
      ) {
        details = <ProposalUpdateBenefitTiers change={terms.change} />;
      }

      break;
    }
    case 'NewFreeform':
    case 'NewSpotMarket':
    case 'UpdateSpotMarket':
    default: {
      break;
    }
  }

  if (indicator != null) {
    details = (
      <div className="flex gap-3 mb-3">
        <div className={getIndicatorStyle(indicator)}>{indicator}</div>
        <div>{details}</div>
      </div>
    );
  }

  return details;
};
