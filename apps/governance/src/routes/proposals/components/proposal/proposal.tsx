import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import { AsyncRenderer, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { ProposalDescription } from '../proposal-description';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalJson } from '../proposal-json';
import { ProposalTerms } from '../proposal-terms';
import { ProposalVotesTable } from '../proposal-votes-table';
import { VoteDetails } from '../vote-details';
import { ListAsset } from '../list-asset';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restData: any;
}

export const Proposal = ({ proposal, restData }: ProposalProps) => {
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
        <ProposalHeader proposal={proposal} isListItem={false} />

        <div className="my-10">
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

        {proposal.terms.change.__typename !== 'NewMarket' &&
          proposal.terms.change.__typename !== 'UpdateMarket' &&
          proposal.terms.change.__typename !== 'NewFreeform' && (
            <div className="mb-4">
              <ProposalTerms data={proposal.terms} />
            </div>
          )}

        <div className="mb-6">
          <ProposalJson proposal={restData?.data?.proposal} />
        </div>

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
          <ProposalVotesTable proposal={proposal} proposalType={proposalType} />
        </div>
      </section>
    </AsyncRenderer>
  );
};
