import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@vegaprotocol/ui-toolkit';
import { differenceInHours, format, formatDistanceToNowStrict } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import {
  ProposalRejectionReasonMapping,
  ProposalState,
} from '@vegaprotocol/types';
import Routes from '../../../routes';
import { type Proposal } from '../../types';

export const ProposalsListItemDetails = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const { t } = useTranslation();
  const state = proposal?.state;
  const nowToEnactmentInHours = differenceInHours(
    new Date(proposal?.terms.closingDatetime),
    new Date()
  );

  let voteDetails: ReactNode;
  let voteStatus: ReactNode;

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      voteDetails =
        proposal?.terms.enactmentDatetime &&
        t('enactedOn{{date}}', {
          enactmentDate:
            proposal?.terms.enactmentDatetime &&
            format(
              new Date(proposal?.terms.enactmentDatetime),
              DATE_FORMAT_DETAILED
            ),
        });
      break;
    }
    case ProposalState.STATE_PASSED: {
      voteDetails =
        proposal?.terms.change.__typename !== 'NewFreeform' &&
        t('enactsOn{{date}}', {
          enactmentDate:
            proposal?.terms.enactmentDatetime &&
            format(
              new Date(proposal.terms.enactmentDatetime),
              DATE_FORMAT_DETAILED
            ),
        });
      break;
    }
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      voteDetails =
        proposal?.terms.change.__typename !== 'NewFreeform' &&
        t('enactsOn{{date}}', {
          enactmentDate:
            proposal?.terms.enactmentDatetime &&
            format(
              new Date(proposal.terms.enactmentDatetime),
              DATE_FORMAT_DETAILED
            ),
        });
      break;
    }
    case ProposalState.STATE_OPEN: {
      voteDetails = (
        <span className={nowToEnactmentInHours < 6 ? 'text-vega-orange' : ''}>
          {formatDistanceToNowStrict(new Date(proposal?.terms.closingDatetime))}{' '}
          {t('left to vote')}
        </span>
      );
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
    <div className="mt-4 items-start text-sm">
      <div className="flex items-center gap-2 text-vega-light-300 mb-2">
        {voteDetails && <span data-testid="vote-details">{voteDetails}</span>}
        {voteDetails && voteStatus && <span>&middot;</span>}
        {voteStatus && <span data-testid="vote-status">{voteStatus}</span>}
      </div>

      {proposal?.id && (
        <Link to={`${Routes.PROPOSALS}/${proposal.id}`}>
          <Button data-testid="view-proposal-btn">{t('viewDetails')}</Button>
        </Link>
      )}
    </div>
  );
};
