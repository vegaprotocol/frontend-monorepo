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
      return t('ProposalSubmitted');
    case ProposalState.WaitingForNodeVote:
      return t('ProposalWaitingForNodeVote');
    case ProposalState.Passed:
      return t('ProposalPassed');
    case ProposalState.Enacted:
      return t('ProposalEnacted');
    case ProposalState.Declined:
      return t('ProposalDeclined');
    case ProposalState.Rejected:
      return t('ProposalRejected');
    case ProposalState.Failed:
      return t('ProposalFailed');
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
