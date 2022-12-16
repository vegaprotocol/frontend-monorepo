import { Link } from 'react-router-dom';
import { Button, Icon } from '@vegaprotocol/ui-toolkit';
import { useVoteInformation } from '../../hooks';
import { useUserVote } from '../vote-details/use-user-vote';
import {
  StatusPass,
  StatusFail,
} from '../current-proposal-status/current-proposal-status';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import type { ReactNode } from 'react';
import {
  ProposalRejectionReasonMapping,
  ProposalState,
} from '@vegaprotocol/types';
import Routes from '../../../routes';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

const MajorityNotReached = () => {
  const { t } = useTranslation();
  return (
    <>
      {t('Majority')} <StatusFail>{t('not reached')}</StatusFail>
    </>
  );
};
const ParticipationNotReached = () => {
  const { t } = useTranslation();
  return (
    <>
      {t('Participation')} <StatusFail>{t('not reached')}</StatusFail>
    </>
  );
};

export const ProposalsListItemDetails = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const state = proposal?.state;
  const { willPassByTokenVote, majorityMet, participationMet } =
    useVoteInformation({
      proposal,
    });
  const { t } = useTranslation();
  const { voteState } = useUserVote(proposal?.id);
  let proposalStatus: ReactNode;
  let voteDetails: ReactNode;
  let voteStatus: ReactNode;

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      proposalStatus = (
        <>
          {t('voteState_Enacted')} <Icon name={'tick'} />
        </>
      );
      voteDetails = proposal?.terms.enactmentDatetime && (
        <>
          {format(
            new Date(proposal?.terms.enactmentDatetime),
            DATE_FORMAT_DETAILED
          )}
        </>
      );
      break;
    }
    case ProposalState.STATE_PASSED: {
      proposalStatus = (
        <>
          {t('voteState_Passed')} <Icon name={'tick'} />
        </>
      );
      voteDetails = proposal?.terms.change.__typename !== 'NewFreeform' && (
        <>
          {t('toEnactOn')}{' '}
          {proposal?.terms.enactmentDatetime &&
            format(
              new Date(proposal.terms.enactmentDatetime),
              DATE_FORMAT_DETAILED
            )}
        </>
      );
      break;
    }
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      proposalStatus = (
        <>
          {t('voteState_WaitingForNodeVote')} <Icon name={'time'} />
        </>
      );
      voteDetails = proposal?.terms.change.__typename !== 'NewFreeform' && (
        <>
          {t('toEnactOn')}{' '}
          {proposal?.terms.enactmentDatetime &&
            format(
              new Date(proposal.terms.enactmentDatetime),
              DATE_FORMAT_DETAILED
            )}
        </>
      );
      break;
    }
    case ProposalState.STATE_OPEN: {
      proposalStatus = (
        <>
          {t('voteState_Open')} <Icon name={'hand'} />
        </>
      );
      voteDetails = (voteState === 'Yes' && (
        <>
          {t('youVoted')} <StatusPass>{t('voteState_Yes')}</StatusPass>
        </>
      )) ||
        (voteState === 'No' && (
          <>
            {t('youVoted')} <StatusFail>{t('voteState_No')}</StatusFail>
          </>
        )) || (
          <>
            {formatDistanceToNowStrict(
              new Date(proposal?.terms.closingDatetime)
            )}{' '}
            {t('left to vote')}
          </>
        );
      voteStatus =
        (!participationMet && <ParticipationNotReached />) ||
        (!majorityMet && <MajorityNotReached />) ||
        (willPassByTokenVote ? (
          <>
            {t('Set to')} <StatusPass>{t('pass')}</StatusPass>
          </>
        ) : (
          <>
            {t('Set to')} <StatusFail>{t('fail')}</StatusFail>
          </>
        ));
      break;
    }
    case ProposalState.STATE_DECLINED: {
      proposalStatus = (
        <>
          {t('voteState_Declined')} <Icon name={'cross'} />
        </>
      );
      voteStatus =
        (!participationMet && <ParticipationNotReached />) ||
        (!majorityMet && <MajorityNotReached />);
      break;
    }
    case ProposalState.STATE_REJECTED: {
      proposalStatus = (
        <>
          <StatusFail>{t('voteState_Rejected')}</StatusFail>{' '}
          <Icon name={'warning-sign'} />
        </>
      );
      voteStatus = proposal?.rejectionReason && (
        <>{t(ProposalRejectionReasonMapping[proposal.rejectionReason])}</>
      );
      break;
    }
  }

  return (
    <div className="grid grid-cols-[1fr_auto] mt-2 items-start gap-2 text-sm">
      <div
        className="col-start-1 row-start-1 flex items-center gap-2 text-white"
        data-testid="proposal-status"
      >
        {proposalStatus}
      </div>
      {voteDetails && (
        <div
          className="col-start-1 row-start-2 text-neutral-500"
          data-testid="vote-details"
        >
          {voteDetails}
        </div>
      )}
      {voteStatus && (
        <div
          className="col-start-2 row-start-1 justify-self-end"
          data-testid="vote-status"
        >
          {voteStatus}
        </div>
      )}
      {proposal?.id && (
        <div className="col-start-2 row-start-2 justify-self-end">
          <Link to={`${Routes.PROPOSALS}/${proposal.id}`}>
            <Button data-testid="view-proposal-btn" size="sm">
              {t('View')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
