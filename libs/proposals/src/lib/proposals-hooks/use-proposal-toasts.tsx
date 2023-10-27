import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  ProposalChangeMapping,
  ProposalRejectionReasonMapping,
  ProposalStateMapping,
} from '@vegaprotocol/types';
import { ProposalState } from '@vegaprotocol/types';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { ExternalLink, Intent } from '@vegaprotocol/ui-toolkit';
import { useCallback } from 'react';
import {
  useOnProposalSubscription,
  type OnProposalFragmentFragment,
} from './__generated__/Proposal';

export const PROPOSAL_STATES_TO_TOAST = [
  ProposalState.STATE_DECLINED,
  ProposalState.STATE_ENACTED,
  ProposalState.STATE_OPEN,
  ProposalState.STATE_PASSED,
];
const CLOSE_AFTER = 0;
type Proposal = OnProposalFragmentFragment;

const ProposalDetails = ({ proposal }: { proposal: Proposal }) => {
  const change = proposal.terms.change;
  switch (change.__typename) {
    case 'UpdateNetworkParameter':
      return <UpdateNetworkParameterDetails proposal={proposal} />;
    default:
      // generic details: rationale title and rejection reason if rejected
      return (
        <>
          {proposal.rationale.title ? (
            <p data-testid="proposal-toast-rationale-title" className="italic">
              {proposal.rationale.title}
            </p>
          ) : null}
          {proposal.state === ProposalState.STATE_REJECTED &&
          proposal.rejectionReason ? (
            <p data-testid="proposal-toast-rejection-reason">
              {t('Rejection reason:')}{' '}
              {ProposalRejectionReasonMapping[proposal.rejectionReason]}
            </p>
          ) : null}
        </>
      );
  }
};

const UpdateNetworkParameterDetails = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const change = proposal.terms.change;
  if (change.__typename !== 'UpdateNetworkParameter') return null;
  return (
    <p data-testid="proposal-toast-network-param" className="italic">
      '{t('Update ')}
      <span className="break-all">{change.networkParameter.key}</span>
      {t(' to ')}
      <span>{change.networkParameter.value}</span>'
    </p>
  );
};

export const ProposalToastContent = ({ proposal }: { proposal: Proposal }) => {
  const tokenLink = useLinks(DApp.Governance);
  const change = proposal.terms.change;

  // Generates toast's title,
  // e.g. Update market proposal enacted, New transfer proposal open, ...
  const title = t('%s proposal %s', [
    change.__typename ? ProposalChangeMapping[change.__typename] : 'Unknown',
    ProposalStateMapping[proposal.state].toLowerCase(),
  ]);

  const enactment = Date.parse(proposal.terms.enactmentDatetime);

  return (
    <div>
      <ToastHeading data-testid="proposal-toast-title">{title}</ToastHeading>
      <ProposalDetails proposal={proposal} />
      {!isNaN(enactment) && (
        <p>
          {t('Enactment date:')} {getDateTimeFormat().format(enactment)}
        </p>
      )}
      <p>
        <ExternalLink
          href={tokenLink(TOKEN_PROPOSAL).replace(':id', proposal?.id || '')}
        >
          {t('View proposal details')}
        </ExternalLink>
      </p>
    </div>
  );
};

export const useProposalToasts = () => {
  const { setToast, remove } = useToasts((store) => ({
    setToast: store.setToast,
    remove: store.remove,
  }));

  const fromProposal = useCallback(
    (proposal: Proposal): Toast => {
      const id = `proposal-toast-${proposal.id}`;
      return {
        id,
        intent: Intent.Warning,
        content: <ProposalToastContent proposal={proposal} />,
        onClose: () => {
          remove(id);
        },
        closeAfter: CLOSE_AFTER,
      };
    },
    [remove]
  );

  return useOnProposalSubscription({
    onData: ({ data }) => {
      const proposal = data.data?.proposals;
      if (!proposal || !proposal.terms.change.__typename) return;
      if (PROPOSAL_STATES_TO_TOAST.includes(proposal.state)) {
        setToast(fromProposal(proposal));
      }
    },
  });
};
