import type { ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { ProposalState } from '@vegaprotocol/types';
import { useVoteInformation } from '../../hooks';
import type { Proposal_proposal } from '../../proposal/__generated__/Proposal';

export const StatusPass = ({ children }: { children: ReactNode }) => (
  <span className="text-vega-green">{children}</span>
);

export const StatusFail = ({ children }: { children: ReactNode }) => (
  <span className="text-danger">{children}</span>
);

const WillPass = ({
  willPass,
  children,
}: {
  willPass: boolean;
  children?: ReactNode;
}) => {
  const { t } = useTranslation();
  if (willPass) {
    return (
      <>
        {children}
        <StatusPass>{t('pass')}</StatusPass>
      </>
    );
  } else {
    return (
      <>
        {children}
        <StatusFail>{t('fail')}</StatusFail>
      </>
    );
  }
};

export const CurrentProposalStatus = ({
  proposal,
}: {
  proposal: Proposal_proposal;
}) => {
  const { willPassByTokenVote, majorityMet, participationMet } =
    useVoteInformation({
      proposal,
    });
  const { t } = useTranslation();

  const daysClosedAgo = formatDistanceToNow(
    new Date(proposal.terms.closingDatetime),
    { addSuffix: true }
  );

  const daysEnactedAgo =
    proposal.terms.enactmentDatetime &&
    formatDistanceToNow(new Date(proposal.terms.enactmentDatetime), {
      addSuffix: true,
    });

  if (proposal.state === ProposalState.STATE_OPEN) {
    return (
      <WillPass willPass={willPassByTokenVote}>{t('currentlySetTo')}</WillPass>
    );
  }

  if (
    proposal.state === ProposalState.STATE_FAILED ||
    proposal.state === ProposalState.STATE_DECLINED ||
    proposal.state === ProposalState.STATE_REJECTED
  ) {
    if (!participationMet) {
      return (
        <>
          <span>{t('voteFailedReason')}</span>
          <StatusFail>{t('participationNotMet')}</StatusFail>
          <span>&nbsp;{daysClosedAgo}</span>
        </>
      );
    }

    if (!majorityMet) {
      return (
        <>
          <span>{t('voteFailedReason')}</span>
          <StatusFail>{t('majorityNotMet')}</StatusFail>
          <span>&nbsp;{daysClosedAgo}</span>
        </>
      );
    }

    return (
      <>
        <span>{t('voteFailedReason')}</span>
        <StatusFail>
          {proposal.errorDetails ||
            proposal.rejectionReason ||
            t('unknownReason')}
        </StatusFail>
        <span>&nbsp;{daysClosedAgo}</span>
      </>
    );
  }
  if (
    proposal.state === ProposalState.STATE_ENACTED ||
    proposal.state === ProposalState.STATE_PASSED
  ) {
    return (
      <>
        <span>{t('votePassed')}</span>
        <StatusPass>
          &nbsp;
          {proposal.state === ProposalState.STATE_ENACTED
            ? t('Enacted')
            : t('Passed')}
        </StatusPass>
        <span>
          &nbsp;
          {proposal.state === ProposalState.STATE_ENACTED
            ? daysEnactedAgo
            : daysClosedAgo}
        </span>
      </>
    );
  }

  if (proposal.state === ProposalState.STATE_WAITING_FOR_NODE_VOTE) {
    return (
      <WillPass willPass={willPassByTokenVote}>
        <span>{t('WaitingForNodeVote')}</span>{' '}
        <span>{t('currentlySetTo')}</span>
      </WillPass>
    );
  }

  return null;
};
