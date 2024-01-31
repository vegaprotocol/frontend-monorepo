import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@vegaprotocol/ui-toolkit';
import { differenceInHours, format, formatDistanceToNowStrict } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import {
  type ProposalRejectionReason,
  ProposalRejectionReasonMapping,
  ProposalState,
} from '@vegaprotocol/types';
import Routes from '../../../routes';
import { type ProposalType } from '../../types';

export const ProposalsListItemDetails = ({
  id,
  type,
  state,
  closingDatetime,
  enactmentDatetime,
  rejectionReason,
}: {
  id: string;
  type: ProposalType;
  state: ProposalState;
  closingDatetime: string;
  enactmentDatetime: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();
  const nowToEnactmentInHours = differenceInHours(
    new Date(closingDatetime),
    new Date()
  );

  let voteDetails: ReactNode;
  let voteStatus: ReactNode;

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      voteDetails =
        enactmentDatetime &&
        t('enactedOn{{date}}', {
          enactmentDate:
            enactmentDatetime &&
            format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
        });
      break;
    }
    case ProposalState.STATE_PASSED: {
      voteDetails =
        type !== 'NewFreeform' &&
        t('enactsOn{{date}}', {
          enactmentDate:
            enactmentDatetime &&
            format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
        });
      break;
    }
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      voteDetails =
        type !== 'NewFreeform' &&
        t('enactsOn{{date}}', {
          enactmentDate:
            enactmentDatetime &&
            format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
        });
      break;
    }
    case ProposalState.STATE_OPEN: {
      voteDetails = (
        <span className={nowToEnactmentInHours < 6 ? 'text-vega-orange' : ''}>
          {formatDistanceToNowStrict(new Date(closingDatetime))}{' '}
          {t('left to vote')}
        </span>
      );
      break;
    }
    case ProposalState.STATE_DECLINED: {
      voteDetails = <span>{t(state)}</span>;
      break;
    }
    case ProposalState.STATE_REJECTED: {
      voteStatus = rejectionReason && (
        <>{t(ProposalRejectionReasonMapping[rejectionReason])}</>
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
      <Link to={`${Routes.PROPOSALS}/${id}`}>
        <Button data-testid="view-proposal-btn">{t('viewDetails')}</Button>
      </Link>
    </div>
  );
};
