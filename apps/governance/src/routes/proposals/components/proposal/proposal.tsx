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
import { useVoteSubmit } from '@vegaprotocol/proposals';
import { useUserVote } from '../vote-details/use-user-vote';
import { type Proposal as IProposal, type BatchProposal } from '../../types';

export interface ProposalProps {
  proposal: IProposal | BatchProposal;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  restData: any;
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

      <div>{/* TODO: add specific proposal type information here */}</div>

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
