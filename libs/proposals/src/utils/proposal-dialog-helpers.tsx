import { ProposalState } from '@vegaprotocol/types';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { useT } from '../use-t';

export const useGetProposalDialogTitle = (
  status?: ProposalState
): string | undefined => {
  const t = useT();
  if (!status) {
    return;
  }

  switch (status) {
    case ProposalState.STATE_OPEN:
      return t('Proposal submitted');
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE:
      return t('Proposal waiting for node vote');
    case ProposalState.STATE_PASSED:
      return t('Proposal passed');
    case ProposalState.STATE_ENACTED:
      return t('Proposal enacted');
    case ProposalState.STATE_DECLINED:
      return t('Proposal declined');
    case ProposalState.STATE_REJECTED:
      return t('Proposal rejected');
    case ProposalState.STATE_FAILED:
      return t('Proposal failed');
    default:
      return t('Submission failed');
  }
};

export const getProposalDialogIntent = (
  status?: ProposalState
): Intent | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_ENACTED:
      return Intent.Success;
    case ProposalState.STATE_OPEN:
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE:
      return Intent.None;
    case ProposalState.STATE_REJECTED:
    case ProposalState.STATE_FAILED:
    case ProposalState.STATE_DECLINED:
      return Intent.Danger;
    default:
      return;
  }
};

export const getProposalDialogIcon = (
  status?: ProposalState
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case ProposalState.STATE_PASSED:
    case ProposalState.STATE_ENACTED:
      return <Icon name="tick" />;
    case ProposalState.STATE_REJECTED:
    case ProposalState.STATE_FAILED:
    case ProposalState.STATE_DECLINED:
      return <Icon name="error" />;
    default:
      return;
  }
};
