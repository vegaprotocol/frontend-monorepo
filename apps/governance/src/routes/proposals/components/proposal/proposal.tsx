import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { AsyncRenderer, Icon, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalDescription } from '../proposal-description';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalJson } from '../proposal-json';
import { ProposalVotesTable } from '../proposal-votes-table';
import { ProposalAssetDetails } from '../proposal-asset-details';
import { VoteDetails } from '../vote-details';
import { ListAsset } from '../list-asset';
import Routes from '../../../routes';
import { ProposalMarketData } from '../proposal-market-data';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { MarketInfoWithData } from '@vegaprotocol/markets';
import type { AssetQuery } from '@vegaprotocol/assets';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { ProposalState } from '@vegaprotocol/types';
import { ProposalMarketChanges } from '../proposal-market-changes';

export enum ProposalType {
  PROPOSAL_NEW_MARKET = 'PROPOSAL_NEW_MARKET',
  PROPOSAL_UPDATE_MARKET = 'PROPOSAL_UPDATE_MARKET',
  PROPOSAL_NEW_ASSET = 'PROPOSAL_NEW_ASSET',
  PROPOSAL_UPDATE_ASSET = 'PROPOSAL_UPDATE_ASSET',
  PROPOSAL_NETWORK_PARAMETER = 'PROPOSAL_NETWORK_PARAMETER',
  PROPOSAL_FREEFORM = 'PROPOSAL_FREEFORM',
}
export interface ProposalProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
  newMarketData?: MarketInfoWithData | null;
  assetData?: AssetQuery | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalMarketProposalRestData?: any;
}

export const Proposal = ({
  proposal,
  restData,
  newMarketData,
  assetData,
  originalMarketProposalRestData,
}: ProposalProps) => {
  const { t } = useTranslation();
  const { params, loading, error } = useNetworkParams([
    NetworkParams.governance_proposal_market_minVoterBalance,
    NetworkParams.governance_proposal_updateMarket_minVoterBalance,
    NetworkParams.governance_proposal_asset_minVoterBalance,
    NetworkParams.governance_proposal_updateAsset_minVoterBalance,
    NetworkParams.governance_proposal_updateNetParam_minVoterBalance,
    NetworkParams.governance_proposal_freeform_minVoterBalance,
    NetworkParams.spam_protection_voting_min_tokens,
  ]);

  if (!proposal) {
    return null;
  }

  let asset = assetData
    ? removePaginationWrapper(assetData.assetsConnection?.edges)[0]
    : undefined;

  if (proposal.terms.change.__typename === 'UpdateAsset' && asset) {
    asset = {
      ...asset,
      quantum: proposal.terms.change.quantum,
    };

    if (asset.source.__typename === 'ERC20') {
      asset.source.lifetimeLimit = proposal.terms.change.source.lifetimeLimit;
      asset.source.withdrawThreshold =
        proposal.terms.change.source.withdrawThreshold;
    }
  }

  let minVoterBalance = null;
  let proposalType = null;

  if (params) {
    switch (proposal.terms.change.__typename) {
      case 'NewMarket':
        minVoterBalance = params.governance_proposal_market_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_NEW_MARKET;
        break;
      case 'UpdateMarket':
        minVoterBalance =
          params.governance_proposal_updateMarket_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_UPDATE_MARKET;
        break;
      case 'NewAsset':
        minVoterBalance = params.governance_proposal_asset_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_NEW_ASSET;
        break;
      case 'UpdateAsset':
        minVoterBalance =
          params.governance_proposal_updateAsset_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_UPDATE_ASSET;
        break;
      case 'UpdateNetworkParameter':
        minVoterBalance =
          params.governance_proposal_updateNetParam_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_NETWORK_PARAMETER;
        break;
      case 'NewFreeform':
        minVoterBalance = params.governance_proposal_freeform_minVoterBalance;
        proposalType = ProposalType.PROPOSAL_FREEFORM;
        break;
    }
  }

  return (
    <AsyncRenderer data={params} loading={loading} error={error}>
      <section data-testid="proposal">
        <div className="flex items-center gap-1">
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
        <ProposalHeader proposal={proposal} isListItem={false} />

        <div id="details">
          <div className="my-10">
            <ProposalChangeTable proposal={proposal} />
          </div>

          {proposal.terms.change.__typename === 'NewAsset' &&
          proposal.terms.change.source.__typename === 'ERC20' &&
          proposal.id ? (
            <ListAsset
              assetId={proposal.id}
              withdrawalThreshold={
                proposal.terms.change.source.withdrawThreshold
              }
              lifetimeLimit={proposal.terms.change.source.lifetimeLimit}
            />
          ) : null}

          <div className="mb-4">
            <ProposalDescription description={proposal.rationale.description} />
          </div>

          {newMarketData && (
            <div className="mb-4">
              <ProposalMarketData marketData={newMarketData} />
            </div>
          )}

          {proposal.terms.change.__typename === 'UpdateMarket' && (
            <div className="mb-4">
              <ProposalMarketChanges
                previousProposal={
                  originalMarketProposalRestData?.data?.proposal?.terms
                    ?.newMarket?.changes || {}
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
                <ProposalAssetDetails asset={asset} />
              </div>
            )}

          <div className="mb-6">
            <ProposalJson proposal={restData?.data?.proposal} />
          </div>
        </div>

        <div id="voting">
          <div className="mb-10">
            <RoundedWrapper paddingBottom={true}>
              <VoteDetails
                proposal={proposal}
                proposalType={proposalType}
                minVoterBalance={minVoterBalance}
                spamProtectionMinTokens={
                  params?.spam_protection_voting_min_tokens
                }
              />
            </RoundedWrapper>
          </div>

          <div className="mb-4">
            <ProposalVotesTable
              proposal={proposal}
              proposalType={proposalType}
            />
          </div>
        </div>
      </section>
    </AsyncRenderer>
  );
};
