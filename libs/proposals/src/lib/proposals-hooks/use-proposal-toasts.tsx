import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { getDateTimeFormat } from '@vegaprotocol/utils';
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
import { Trans } from 'react-i18next';
import { useT } from '../../use-t';

export const PROPOSAL_STATES_TO_TOAST = [
  ProposalState.STATE_DECLINED,
  ProposalState.STATE_ENACTED,
  ProposalState.STATE_OPEN,
  ProposalState.STATE_PASSED,
];
const CLOSE_AFTER = 0;
type Proposal = OnProposalFragmentFragment;

const ProposalDetails = ({ proposal }: { proposal: Proposal }) => {
  const t = useT();
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
              {t('Rejection reason: {{reason}}', {
                reason:
                  ProposalRejectionReasonMapping[proposal.rejectionReason],
              })}
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
      <Trans
        defaults="Update <0>{{key}}</0> to {{value}}"
        values={change.networkParameter}
        components={[<span className="break-all">key</span>]}
      />
    </p>
  );
};

export const ProposalToastContent = ({ proposal }: { proposal: Proposal }) => {
  const t = useT();
  const tokenLink = useLinks(DApp.Governance);
  const change = proposal.terms.change;

  // Generates toast's title,
  // e.g. Update market proposal enacted, New transfer proposal open, ...
  const title = change.__typename
    ? t('{{proposalChange}} proposal {{proposalState}}', {
        proposalChange: ProposalChangeMapping[change.__typename],
        proposalState: ProposalStateMapping[proposal.state].toLowerCase(),
      })
    : t('Unknown proposal {{proposalState}}', {
        proposalState: ProposalStateMapping[proposal.state].toLowerCase(),
      });

  const enactment = Date.parse(proposal.terms.enactmentDatetime);

  return (
    <div>
      <ToastHeading data-testid="proposal-toast-title">{title}</ToastHeading>
      <ProposalDetails proposal={proposal} />
      {!isNaN(enactment) && (
        <p>
          {t('Enactment date: {{date}}', {
            date: getDateTimeFormat().format(enactment),
          })}
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
