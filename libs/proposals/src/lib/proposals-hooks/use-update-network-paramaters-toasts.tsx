import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { UpdateNetworkParameter } from '@vegaprotocol/types';
import { ProposalStateMapping } from '@vegaprotocol/types';
import { ProposalState } from '@vegaprotocol/types';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { ToastHeading } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { ExternalLink, Intent } from '@vegaprotocol/ui-toolkit';
import { useCallback } from 'react';
import type { UpdateNetworkParameterProposalFragment } from './__generated__/Proposal';
import { useOnUpdateNetworkParametersSubscription } from './__generated__/Proposal';

export const PROPOSAL_STATES_TO_TOAST = [
  ProposalState.STATE_DECLINED,
  ProposalState.STATE_ENACTED,
  ProposalState.STATE_OPEN,
  ProposalState.STATE_PASSED,
];
const CLOSE_AFTER = 0;
type Proposal = UpdateNetworkParameterProposalFragment;

const UpdateNetworkParameterToastContent = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const tokenLink = useLinks(DApp.Token);
  const change = proposal.terms.change as UpdateNetworkParameter;
  const title = t('Network change proposal %s').replace(
    '%s',
    ProposalStateMapping[proposal.state].toLowerCase()
  );
  const enactment = Date.parse(proposal.terms.enactmentDatetime);
  return (
    <div>
      <ToastHeading>{title}</ToastHeading>
      <p className="italic">
        '{t('Update ')}
        <span className="break-all">{change.networkParameter.key}</span>
        {t(' to ')}
        <span>{change.networkParameter.value}</span>'
      </p>
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

export const useUpdateNetworkParametersToasts = () => {
  const { setToast, remove } = useToasts((store) => ({
    setToast: store.setToast,
    remove: store.remove,
  }));

  const fromProposal = useCallback(
    (proposal: Proposal): Toast => {
      const id = `update-network-param-proposal-${proposal.id}`;
      return {
        id: `update-network-param-proposal-${proposal.id}`,
        intent: Intent.Warning,
        content: <UpdateNetworkParameterToastContent proposal={proposal} />,
        onClose: () => {
          remove(id);
        },
        closeAfter: CLOSE_AFTER,
      };
    },
    [remove]
  );

  return useOnUpdateNetworkParametersSubscription({
    onData: ({ data }) => {
      // note proposals is poorly named, it is actually a single proposal
      const proposal = data.data?.proposals;
      if (!proposal) return;
      if (proposal.terms.change.__typename !== 'UpdateNetworkParameter') return;

      // if one of the following states show a toast
      if (PROPOSAL_STATES_TO_TOAST.includes(proposal.state)) {
        setToast(fromProposal(proposal));
      }
    },
  });
};
