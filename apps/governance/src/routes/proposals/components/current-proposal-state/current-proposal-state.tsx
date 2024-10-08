import { useTranslation } from 'react-i18next';
import {
  ProposalState,
  ProtocolUpgradeProposalStatus,
} from '@vegaprotocol/types';
import { type ReactNode } from 'react';
import { cn } from '@vegaprotocol/ui-toolkit';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

export enum AdditionalProposalState {
  /**
   * Used for overall state of a batch proposal when any of the sub-proposals
   * didn't pass.
   */
  PASSED_WITH_ERRORS = 'PASSED_WITH_ERRORS',
}

type State = ProposalState | AdditionalProposalState;

const PROPOSAL_STATE_COLOR_MAP: { [state in State]: string } = {
  [ProposalState.STATE_OPEN]: 'bg-white text-black',
  [ProposalState.STATE_ENACTED]: 'bg-green-500 text-black',
  [ProposalState.STATE_PASSED]: 'bg-green-500 text-black',
  [ProposalState.STATE_DECLINED]: 'bg-red-500',
  [ProposalState.STATE_FAILED]: 'bg-red-500',
  [ProposalState.STATE_REJECTED]: 'bg-red-500',
  [ProposalState.STATE_WAITING_FOR_NODE_VOTE]: 'bg-blue-650',
  [AdditionalProposalState.PASSED_WITH_ERRORS]: 'bg-yellow-500 text-black',
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
  tooltip,
  children,
}: {
  proposalState:
    | ProposalState
    | AdditionalProposalState
    | ProtocolUpgradeProposalStatus;
  className?: string;
  tooltip?: ReactNode;
  children?: ReactNode;
}) => {
  const { t } = useTranslation();
  let proposalStatus: ReactNode;

  let state: ProposalState | AdditionalProposalState;
  if (Object.keys(UPGRADE_STATUS_PROPOSAL_STATE_MAP).includes(proposalState)) {
    state =
      UPGRADE_STATUS_PROPOSAL_STATE_MAP[
        proposalState as ProtocolUpgradeProposalStatus
      ];
  } else {
    state = proposalState as ProposalState | AdditionalProposalState;
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
    case AdditionalProposalState.PASSED_WITH_ERRORS: {
      proposalStatus = t('voteState_PassedWithErrors');
      break;
    }
  }

  if (tooltip) {
    proposalStatus = (
      <Tooltip description={tooltip}>
        <span>{proposalStatus}</span>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        'rounded px-1 py-[2px]',
        'text-xs',
        'flex items-center gap-1',
        PROPOSAL_STATE_COLOR_MAP[state],
        { 'cursor-help': Boolean(tooltip) },
        className
      )}
    >
      <span>{proposalStatus}</span>
      {children}
    </div>
  );
};
