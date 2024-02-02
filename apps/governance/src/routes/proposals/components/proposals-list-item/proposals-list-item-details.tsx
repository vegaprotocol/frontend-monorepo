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
  enactmentDatetime?: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 items-start text-sm">
      <div className="flex items-center gap-2 text-vega-light-300 mb-2">
        <VoteStateText
          type={type}
          state={state}
          enactmentDatetime={enactmentDatetime}
          closingDatetime={closingDatetime}
          rejectionReason={rejectionReason}
        />
      </div>
      <Link to={`${Routes.PROPOSALS}/${id}`}>
        <Button data-testid="view-proposal-btn">{t('viewDetails')}</Button>
      </Link>
    </div>
  );
};

const VoteStateText = ({
  type,
  state,
  closingDatetime,
  enactmentDatetime,
  rejectionReason,
}: {
  type: ProposalType;
  state: ProposalState;
  closingDatetime: string;
  enactmentDatetime?: string;
  rejectionReason: ProposalRejectionReason | null | undefined;
}) => {
  const { t } = useTranslation();
  const nowToEnactmentInHours = differenceInHours(
    new Date(closingDatetime),
    new Date()
  );

  const props = {
    'data-testid': 'vote-details',
  };

  switch (state) {
    case ProposalState.STATE_ENACTED: {
      // TODO: handle batch proposal which might have many enactment times
      return (
        <p {...props}>
          {t('enactedOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_PASSED: {
      // TODO: handle batch proposal which might have many enactment times
      return (
        <p {...props}>
          {t('enactsOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      // TODO: handle batch proposal which might have many enactment times
      return (
        <p {...props}>
          {t('enactsOn{{date}}', {
            enactmentDate:
              enactmentDatetime &&
              format(new Date(enactmentDatetime), DATE_FORMAT_DETAILED),
          })}
        </p>
      );
    }
    case ProposalState.STATE_OPEN: {
      return (
        <p {...props}>
          <span className={nowToEnactmentInHours < 6 ? 'text-vega-orange' : ''}>
            {formatDistanceToNowStrict(new Date(closingDatetime))}{' '}
            {t('left to vote')}
          </span>
        </p>
      );
    }
    case ProposalState.STATE_DECLINED: {
      return <p {...props}>{t(state)}</p>;
    }
    case ProposalState.STATE_REJECTED: {
      const props = { 'data-testid': 'vote-status' };

      if (rejectionReason) {
        return (
          <p {...props}>{t(ProposalRejectionReasonMapping[rejectionReason])}</p>
        );
      }

      return <p {...props}>{t('Proposal rejected')}</p>;
    }
    default: {
      return null;
    }
  }
};
