import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalDescription } from '../proposal-description';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalJson } from '../proposal-json';
import { ProposalAssetDetails } from '../proposal-asset-details';
import { ProposalReferralProgramDetails } from '../proposal-referral-program-details';
import { ProposalVolumeDiscountProgramDetails } from '../proposal-volume-discount-program-details';
import { UserVote } from '../vote-details';
import { ListAsset } from '../list-asset';
import Routes from '../../../routes';
import { ProposalMarketData } from '../proposal-market-data';
import { type MarketInfo } from '@vegaprotocol/markets';
import { type AssetQuery } from '@vegaprotocol/assets';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { ProposalState } from '@vegaprotocol/types';
import { ProposalMarketChanges } from '../proposal-market-changes';
import { ProposalUpdateMarketState } from '../proposal-update-market-state';
import { useVoteSubmit } from '@vegaprotocol/proposals';
import { useUserVote } from '../vote-details/use-user-vote';
import {
  ProposalCancelTransferDetails,
  ProposalTransferDetails,
} from '../proposal-transfer';
import { useFeatureFlags } from '@vegaprotocol/environment';
import { ProposalUpdateBenefitTiers } from '../proposal-update-benefit-tiers';
import { type Proposal as IProposal, type BatchProposal } from '../../types';

export interface ProposalProps {
  proposal: IProposal | BatchProposal;
  marketData?: MarketInfo | null;
  parentMarketData?: MarketInfo | null;
  assetData?: AssetQuery | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalMarketProposalRestData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mostRecentlyEnactedAssociatedMarketProposal?: any;
}

export const Proposal = (props: ProposalProps) => {
  if (props.proposal.__typename === 'Proposal') {
    return <SingleProposal {...props} proposal={props.proposal} />;
  }

  if (props.proposal.__typename === 'BatchProposal') {
    return <div>TODO: I am batch</div>;
  }

  throw new Error('Invalid proposal');
};

export const SingleProposal = ({
  proposal,
  restData,
  marketData,
  parentMarketData,
  assetData,
  originalMarketProposalRestData,
  mostRecentlyEnactedAssociatedMarketProposal,
}: ProposalProps & { proposal: IProposal }) => {
  const featureFlags = useFeatureFlags((state) => state.flags);
  const { t } = useTranslation();
  const { submit, Dialog, finalizedVote, transaction } = useVoteSubmit();
  const { voteState, voteDatetime } = useUserVote(proposal?.id, finalizedVote);

  if (!proposal) {
    return null;
  }

  let asset = assetData
    ? removePaginationWrapper(assetData.assetsConnection?.edges)[0]
    : undefined;

  const originalAsset = asset;

  if (proposal.terms.change.__typename === 'UpdateAsset' && asset) {
    asset = {
      ...asset,
      quantum: proposal.terms.change.quantum,
      source: { ...asset.source },
    };

    if (asset.source.__typename === 'ERC20') {
      asset.source.lifetimeLimit = proposal.terms.change.source.lifetimeLimit;
      asset.source.withdrawThreshold =
        proposal.terms.change.source.withdrawThreshold;
    }
  }

  // Show governance transfer details only if the GOVERNANCE_TRANSFERS flag is on.
  const governanceTransferDetails = featureFlags.GOVERNANCE_TRANSFERS && (
    <>
      {proposal.terms.change.__typename === 'NewTransfer' && (
        /** Governance New Transfer Details */
        <div className="mb-4">
          <ProposalTransferDetails proposal={proposal} />
        </div>
      )}

      {proposal.terms.change.__typename === 'CancelTransfer' && (
        /** Governance Cancel Transfer Details */
        <div className="mb-4">
          <ProposalCancelTransferDetails proposal={proposal} />
        </div>
      )}
    </>
  );

  return (
    <section data-testid="proposal">
      <div className="flex items-center gap-1 mb-6">
        <Icon name={'chevron-left'} />

        {proposal.state === ProposalState.STATE_REJECTED ? (
          <div data-testid="rejected-proposals-link">
            <Link className="underline" to={Routes.PROPOSALS_REJECTED}>
              {t('RejectedProposals')}
            </Link>
          </div>
        ) : (
          <div data-testid="all-proposals-link">
            <Link className="underline" to={Routes.PROPOSALS}>
              {t('AllProposals')}
            </Link>
          </div>
        )}
      </div>

      <ProposalHeader
        proposal={proposal}
        isListItem={false}
        voteState={voteState}
      />

      <div className="my-10 break-all">
        <ProposalChangeTable proposal={proposal} />
      </div>

      {proposal.terms.change.__typename === 'NewAsset' &&
      proposal.terms.change.source.__typename === 'ERC20' &&
      proposal.id ? (
        <ListAsset
          assetId={proposal.id}
          withdrawalThreshold={proposal.terms.change.source.withdrawThreshold}
          lifetimeLimit={proposal.terms.change.source.lifetimeLimit}
        />
      ) : null}

      <div className="mb-4">
        <ProposalDescription description={proposal.rationale.description} />
      </div>

      {marketData && (
        <div className="mb-4">
          <ProposalMarketData
            marketData={marketData}
            parentMarketData={parentMarketData ? parentMarketData : undefined}
          />
        </div>
      )}

      {proposal.terms.change.__typename === 'UpdateMarketState' && (
        <div className="mb-4">
          <ProposalUpdateMarketState change={proposal.terms.change} />
        </div>
      )}

      {proposal.terms.change.__typename === 'UpdateMarket' && (
        <div className="mb-4">
          <ProposalMarketChanges
            originalProposal={
              originalMarketProposalRestData?.data?.proposal?.terms?.newMarket
                ?.changes || {}
            }
            latestEnactedProposal={
              mostRecentlyEnactedAssociatedMarketProposal?.node?.proposal?.terms
                ?.updateMarket?.changes || {}
            }
            updatedProposal={
              restData?.data?.proposal?.terms?.updateMarket?.changes || {}
            }
          />
        </div>
      )}

      {(proposal.terms.change.__typename === 'NewAsset' ||
        proposal.terms.change.__typename === 'UpdateAsset') &&
        asset && (
          <div className="mb-4">
            <ProposalAssetDetails asset={asset} originalAsset={originalAsset} />
          </div>
        )}

      {proposal.terms.change.__typename === 'UpdateReferralProgram' && (
        <div className="mb-4">
          <ProposalReferralProgramDetails change={proposal.terms.change} />
        </div>
      )}

      {proposal.terms.change.__typename === 'UpdateVolumeDiscountProgram' && (
        <div className="mb-4">
          <ProposalVolumeDiscountProgramDetails
            change={proposal.terms.change}
          />
        </div>
      )}

      {proposal.terms.change.__typename === 'UpdateNetworkParameter' &&
        proposal.terms.change.networkParameter.key.slice(-13) ===
          '.benefitTiers' && (
          <div className="mb-4">
            <ProposalUpdateBenefitTiers change={proposal.terms.change} />
          </div>
        )}

      {governanceTransferDetails}

      <div className="mb-10">
        <RoundedWrapper paddingBottom={true}>
          <UserVote
            proposal={proposal}
            submit={submit}
            dialog={Dialog}
            transaction={transaction}
            voteState={voteState}
            voteDatetime={voteDatetime}
          />
        </RoundedWrapper>
      </div>

      <div className="mb-6">
        <ProposalJson proposal={restData?.data?.proposal} />
      </div>
    </section>
  );
};
