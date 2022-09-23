import { Schema } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';
import { Icon, Intent } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

export const getProposalDialogTitle = (
  status?: Schema.ProposalState
): string | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.ProposalState.STATE_OPEN:
      return t('Proposal submitted');
    case Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE:
      return t('Proposal waiting for node vote');
    case Schema.ProposalState.STATE_PASSED:
      return t('Proposal passed');
    case Schema.ProposalState.STATE_ENACTED:
      return t('Proposal enacted');
    case Schema.ProposalState.STATE_DECLINED:
      return t('Proposal declined');
    case Schema.ProposalState.STATE_REJECTED:
      return t('Proposal rejected');
    case Schema.ProposalState.STATE_FAILED:
      return t('Proposal failed');
    default:
      return t('Submission failed');
  }
};

export const getProposalDialogIntent = (
  status?: Schema.ProposalState
): Intent | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.ProposalState.STATE_PASSED:
    case Schema.ProposalState.STATE_ENACTED:
      return Intent.Success;
    case Schema.ProposalState.STATE_OPEN:
    case Schema.ProposalState.STATE_WAITING_FOR_NODE_VOTE:
      return Intent.None;
    case Schema.ProposalState.STATE_REJECTED:
    case Schema.ProposalState.STATE_FAILED:
    case Schema.ProposalState.STATE_DECLINED:
      return Intent.Danger;
    default:
      return;
  }
};

export const getProposalDialogIcon = (
  status?: Schema.ProposalState
): ReactNode | undefined => {
  if (!status) {
    return;
  }

  switch (status) {
    case Schema.ProposalState.STATE_PASSED:
    case Schema.ProposalState.STATE_ENACTED:
      return <Icon name="tick" />;
    case Schema.ProposalState.STATE_REJECTED:
    case Schema.ProposalState.STATE_FAILED:
    case Schema.ProposalState.STATE_DECLINED:
      return <Icon name="error" />;
    default:
      return;
  }
};
