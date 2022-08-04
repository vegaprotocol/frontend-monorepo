import { ProposalState } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

export const getProposalDialogTitle = (
  status?: ProposalState
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case ProposalState.Open:
      return t('Proposal submitted');
    case ProposalState.WaitingForNodeVote:
      return t('Proposal waiting for node vote');
    case ProposalState.Passed:
      return t('Proposal passed');
    case ProposalState.Enacted:
      return t('Proposal enacted');
    case ProposalState.Declined:
      return t('Proposal declined');
    case ProposalState.Rejected:
      return t('Proposal rejected');
    case ProposalState.Failed:
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
    case ProposalState.Passed:
    case ProposalState.Enacted:
      return Intent.Success;
    case ProposalState.Open:
    case ProposalState.WaitingForNodeVote:
      return Intent.None;
    case ProposalState.Rejected:
    case ProposalState.Failed:
    case ProposalState.Declined:
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
    case ProposalState.Passed:
    case ProposalState.Enacted:
      return <Icon name="tick" size={20} />;
    case ProposalState.Rejected:
    case ProposalState.Failed:
    case ProposalState.Declined:
      return <Icon name="error" size={20} />;
    default:
      return;
  }
};
