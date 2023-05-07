import { Link } from 'react-router-dom';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useVoteInformation } from '../../hooks';
import { useUserVote } from '../vote-details/use-user-vote';
import { StatusPass } from '../current-proposal-status/current-proposal-status';
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
      {t('Majority')} {t('not reached')}
    </>
  );
};
const ParticipationNotReached = () => {
  const { t } = useTranslation();
  return (
    <>
      {t('Participation')} {t('not reached')}
    </>
  );
};

export const ProposalsListItemDetails = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const state = proposal?.state;
  const {
    willPassByTokenVote,
    willPassByLPVote,
    majorityMet,
    participationMet,
  } = useVoteInformation({
    proposal,
  });
  const { t } = useTranslation();
  const { voteState } = useUserVote(proposal?.id);
  const isUpdateMarket = proposal?.terms.change.__typename === 'UpdateMarket';
  const updateMarketWillPass = willPassByTokenVote || willPassByLPVote;
  const updateMarketVotePassMethod = willPassByTokenVote
    ? t('byTokenVote')
    : t('byLPVote');

  let voteDetails: ReactNode;
  let voteStatus: ReactNode;

  switch (state) {
    case ProposalState.STATE_ENACTED: {
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
      voteDetails = (voteState === 'Yes' && (
        <>
          {t('youVoted')} {t('voteState_Yes')}
        </>
      )) ||
        (voteState === 'No' && (
          <>
            {t('youVoted')} {t('voteState_No')}
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
        (isUpdateMarket &&
          (updateMarketWillPass ? (
            <>
              {t('Set to')}{' '}
              <StatusPass>
                {t('pass')} {updateMarketVotePassMethod}
              </StatusPass>
            </>
          ) : (
            <>
              {t('Set to')} {t('fail')}
            </>
          ))) ||
        (!participationMet && <ParticipationNotReached />) ||
        (!majorityMet && <MajorityNotReached />) ||
        (willPassByTokenVote ? (
          <>
            {t('Set to')} {t('pass')}
          </>
        ) : (
          <>
            {t('Set to')} {t('fail')}
          </>
        ));
      break;
    }
    case ProposalState.STATE_DECLINED: {
      voteStatus =
        (!participationMet && <ParticipationNotReached />) ||
        (!majorityMet && <MajorityNotReached />);
      break;
    }
    case ProposalState.STATE_REJECTED: {
      voteStatus = proposal?.rejectionReason && (
        <>{t(ProposalRejectionReasonMapping[proposal.rejectionReason])}</>
      );
      break;
    }
  }

  return (
    <div className="grid grid-cols-[1fr_auto] mt-4 items-start gap-2 text-sm">
      {voteDetails && (
        <div
          className="col-start-1 row-start-2 text-vega-light-300"
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
            <Button data-testid="view-proposal-btn">{t('View')}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
