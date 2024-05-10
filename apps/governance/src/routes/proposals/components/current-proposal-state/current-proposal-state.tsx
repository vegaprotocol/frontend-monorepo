import { useTranslation } from 'react-i18next';
import {
  ProposalState,
  ProtocolUpgradeProposalStatus,
} from '@vegaprotocol/types';
import { type ReactNode } from 'react';
import classNames from 'classnames';

const PROPOSAL_STATE_COLOR_MAP: { [state in ProposalState]: string } = {
  [ProposalState.STATE_OPEN]: 'bg-vega-green text-black',
  [ProposalState.STATE_ENACTED]: 'bg-vega-green-650',
  [ProposalState.STATE_PASSED]: 'bg-vega-green-650',
  [ProposalState.STATE_DECLINED]: 'bg-vega-red',
  [ProposalState.STATE_FAILED]: 'bg-vega-red-600',
  [ProposalState.STATE_REJECTED]: 'bg-vega-red-600',
  [ProposalState.STATE_WAITING_FOR_NODE_VOTE]: 'bg-vega-blue-650',
};

export const UPGRADE_STATUS_PROPOSAL_STATE_MAP = {
  [ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_APPROVED]:
    ProposalState.STATE_ENACTED,
  [ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_PENDING]:
    ProposalState.STATE_OPEN,
  [ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_REJECTED]:
    ProposalState.STATE_REJECTED,
  [ProtocolUpgradeProposalStatus.PROTOCOL_UPGRADE_PROPOSAL_STATUS_UNSPECIFIED]:
    ProposalState.STATE_REJECTED,
};

export const CurrentProposalState = ({
  proposalState,
  className,
  children,
}: {
  proposalState: ProposalState | ProtocolUpgradeProposalStatus;
  className?: classNames.Argument;
  children?: ReactNode;
}) => {
  const { t } = useTranslation();
  let proposalStatus: ReactNode;

  let state: ProposalState;
  if (Object.keys(UPGRADE_STATUS_PROPOSAL_STATE_MAP).includes(proposalState)) {
    state =
      UPGRADE_STATUS_PROPOSAL_STATE_MAP[
        proposalState as ProtocolUpgradeProposalStatus
      ];
  } else {
    state = proposalState as ProposalState;
  }

  switch (state) {
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
    <div
      className={classNames(
        'rounded px-1 py-[2px]',
        'font-alpha text-xs',
        'flex items-center gap-1',
        PROPOSAL_STATE_COLOR_MAP[state],
        className
      )}
    >
      <span>{proposalStatus}</span>
      {children}
    </div>
  );
};
