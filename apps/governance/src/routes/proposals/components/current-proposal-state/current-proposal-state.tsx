import { useTranslation } from 'react-i18next';
import { Icon } from '@vegaprotocol/ui-toolkit';
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
      proposalStatus = (
        <>
          <span className="mr-2">{t('voteState_Enacted')}</span>
          <Icon name={'tick'} />
        </>
      );
      break;
    }
    case ProposalState.STATE_PASSED: {
      proposalStatus = (
        <>
          <span className="mr-2">{t('voteState_Passed')}</span>
          <Icon name={'tick'} />
        </>
      );
      break;
    }
    case ProposalState.STATE_WAITING_FOR_NODE_VOTE: {
      proposalStatus = (
        <>
          <span className="mr-2">{t('voteState_WaitingForNodeVote')}</span>
          <Icon name={'time'} />
        </>
      );
      break;
    }
    case ProposalState.STATE_OPEN: {
      variant = 'primary' as ProposalInfoLabelVariant;
      proposalStatus = <>{t('voteState_Open')}</>;
      break;
    }
    case ProposalState.STATE_DECLINED: {
      proposalStatus = (
        <>
          <span className="mr-2">{t('voteState_Declined')}</span>
          <Icon name={'cross'} />
        </>
      );
      break;
    }
    case ProposalState.STATE_REJECTED: {
      proposalStatus = (
        <>
          <span className="mr-2">{t('voteState_Rejected')}</span>
          <Icon name={'warning-sign'} />
        </>
      );
      break;
    }
  }

  return (
    <ProposalInfoLabel variant={variant}>{proposalStatus}</ProposalInfoLabel>
  );
};
