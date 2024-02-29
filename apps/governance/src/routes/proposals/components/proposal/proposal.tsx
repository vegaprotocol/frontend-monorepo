import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon, RoundedWrapper } from '@vegaprotocol/ui-toolkit';
import { ProposalHeader } from '../proposal-detail-header/proposal-header';
import { ProposalDescription } from '../proposal-description';
import { ProposalChangeTable } from '../proposal-change-table';
import { ProposalJson } from '../proposal-json';
import { UserVote } from '../vote-details';
import Routes from '../../../routes';
import { ProposalState } from '@vegaprotocol/types';
import { type ProposalNode } from './proposal-utils';
import { useVoteSubmit } from '@vegaprotocol/proposals';
import { useUserVote } from '../vote-details/use-user-vote';
import { type Proposal as IProposal, type BatchProposal } from '../../types';
import { ProposalChangeDetails } from './proposal-change-details';
import { type JsonValue } from 'type-fest';

export interface ProposalProps {
  proposal: IProposal | BatchProposal;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restData: ProposalNode | null;
}

export const Proposal = ({ proposal, restData }: ProposalProps) => {
  const { t } = useTranslation();
  const { submit, Dialog, finalizedVote, transaction } = useVoteSubmit();
  const { voteState, voteDatetime } = useUserVote(proposal?.id, finalizedVote);

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

      <div className="mb-4">
        <ProposalDescription description={proposal.rationale.description} />
      </div>

      <div className="mb-4 flex flex-col gap-0">
        {proposal.__typename === 'Proposal' ? (
          <ProposalChangeDetails
            proposal={proposal}
            terms={proposal.terms}
            restData={restData}
          />
        ) : proposal.__typename === 'BatchProposal' ? (
          proposal.subProposals?.map((p, i) => {
            if (!p?.terms) return null;
            return (
              <ProposalChangeDetails
                indicator={i + 1}
                key={i}
                proposal={proposal}
                terms={p.terms}
                restData={restData}
              />
            );
          })
        ) : null}
      </div>

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
        <ProposalJson proposal={restData?.proposal as unknown as JsonValue} />
      </div>
    </section>
  );
};
