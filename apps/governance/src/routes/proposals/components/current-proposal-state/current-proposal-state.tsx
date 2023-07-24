import { useTranslation } from 'react-i18next';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import { ProposalState } from '@vegaprotocol/types';
import { ProposalInfoLabel } from '../proposal-info-label';
import type { ReactNode } from 'react';
import type { ProposalInfoLabelVariant } from '../proposal-info-label';

export const CurrentProposalState = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const { t } = useTranslation();
  let proposalStatus: ReactNode;
  let variant = 'tertiary' as ProposalInfoLabelVariant;

  switch (proposal?.state) {
    case ProposalState.STATE_ENACTED: {
      proposalStatus = t('voteState_Enacted');
      break;
    }
    case ProposalState.STATE_PASSED: {
      proposalStatus = t('voteState_Passed');
      break;
    }
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      proposalStatus = t('voteState_WaitingForNodeVote');
      break;
    }
    case ProposalState.STATE_OPEN: {
      variant = 'primary' as ProposalInfoLabelVariant;
      proposalStatus = t('voteState_Open');
      break;
    }
    case ProposalState.STATE_DECLINED: {
      proposalStatus = t('voteState_Declined');
      break;
    }
    case ProposalState.STATE_REJECTED: {
      proposalStatus = t('voteState_Rejected');
      break;
    }
    case ProposalState.STATE_FAILED: {
      proposalStatus = t('voteState_Failed');
      break;
    }
  }

  return (
    <ProposalInfoLabel variant={variant}>{proposalStatus}</ProposalInfoLabel>
  );
};
