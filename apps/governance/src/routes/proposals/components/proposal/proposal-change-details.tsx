import { Trans, useTranslation } from 'react-i18next';
import {
  type BatchProposalFieldsFragment,
  type ProposalFieldsFragment,
  type ProposalTermsFieldsFragment,
} from '../../__generated__/Proposals';
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
import { type ProposalNode } from './proposal-utils';
import { Lozenge } from '@vegaprotocol/ui-toolkit';
import { Indicator } from './indicator';
import { SubHeading } from '../../../../components/heading';

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
  const { t } = useTranslation();
  let details = null;

  let proposalId: string | undefined = proposal.id || undefined;
  if (proposal.__typename === 'BatchProposal' && indicator) {
    proposalId = proposal.subProposals?.[indicator - 1]?.id || undefined;
  }

  switch (terms.change.__typename) {
    case 'NewAsset': {
      if (proposalId && terms.change.source.__typename === 'ERC20') {
        details = (
          <div>
            <ListAsset
              assetId={proposalId}
              withdrawalThreshold={terms.change.source.withdrawThreshold}
              lifetimeLimit={terms.change.source.lifetimeLimit}
            />
            <ProposalAssetDetails change={terms.change} assetId={proposalId} />
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
    case 'NewSpotMarket':
    case 'NewMarket': {
      if (proposal.id) {
        const marketId = getMarketId(proposal, indicator);
        details =
          marketId.length > 0 ? (
            <ProposalMarketData
              marketId={marketId}
              code={terms.change.instrument.code}
            />
          ) : null;
      }
      break;
    }
    case 'UpdateSpotMarket':
    case 'UpdateMarket': {
      if (proposal.id) {
        details = (
          <div className="flex flex-col gap-4">
            <ProposalMarketData marketId={terms.change.marketId} />
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
      if (proposalId) {
        details = <ProposalTransferDetails proposalId={proposalId} />;
      }
      break;
    }
    case 'CancelTransfer': {
      if (proposalId) {
        details = <ProposalCancelTransferDetails proposalId={proposalId} />;
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
      } else {
        details = (
          <div className="mb-4">
            <SubHeading title={t(terms.change.__typename as string)} />
            <span>
              <Trans
                i18nKey="Change <lozenge>{{key}}</lozenge> to <lozenge>{{value}}</lozenge>"
                values={{
                  key: terms.change.networkParameter.key,
                  value: terms.change.networkParameter.value,
                }}
                components={{
                  // @ts-ignore children passed by i18next
                  lozenge: <Lozenge />,
                }}
              />
            </span>
          </div>
        );
      }

      break;
    }
    case 'NewFreeform':
    default: {
      break;
    }
  }

  if (indicator != null && details != null) {
    details = (
      <div className="grid grid-cols-[40px_minmax(0,1fr)] grid-rows-1 gap-3 mb-3">
        <div className="w-10">
          <Indicator indicator={indicator} />
        </div>
        <div>{details}</div>
      </div>
    );
  }

  return details;
};

const getMarketId = (
  proposal: ProposalFieldsFragment | BatchProposalFieldsFragment,
  indicator?: number
) => {
  let marketId = proposal.id;

  // if it's a batch proposal then each sub proposal has its own id
  // which corresponds to the new market id
  if (proposal.__typename === 'BatchProposal' && indicator != null) {
    marketId =
      (proposal.subProposals && proposal.subProposals[indicator - 1]?.id) || '';
  }

  return marketId || '';
};
