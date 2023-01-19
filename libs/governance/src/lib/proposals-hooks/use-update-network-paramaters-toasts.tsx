import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { getDateTimeFormat, t } from '@vegaprotocol/react-helpers';
import type { UpdateNetworkParameter } from '@vegaprotocol/types';
import { ProposalStateMapping } from '@vegaprotocol/types';
import { ProposalState } from '@vegaprotocol/types';
import type { Toast } from '@vegaprotocol/ui-toolkit';
import { useToasts } from '@vegaprotocol/ui-toolkit';
import { ExternalLink, Intent } from '@vegaprotocol/ui-toolkit';
import compact from 'lodash/compact';
import { useCallback } from 'react';
import type { UpdateNetworkParameterFieldsFragment } from './__generated__/Proposal';
import { useOnUpdateNetworkParametersSubscription } from './__generated__/Proposal';

const CLOSE_AFTER = 5000;
type Proposal = UpdateNetworkParameterFieldsFragment;

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
      <h3 className="font-bold">{title}</h3>
      <p className="italic">
        '
        {t(
          `Update ${change.networkParameter.key} to ${change.networkParameter.value}`
        )}
        '
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

export const useUpdateNetworkParametersToasts = (): Toast[] => {
  const { proposalToasts, setToast, remove } = useToasts((store) => ({
    proposalToasts: store.toasts,
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
        onClose: () => remove(id),
        closeAfter: CLOSE_AFTER,
      };
    },
    [remove]
  );

  useOnUpdateNetworkParametersSubscription({
    onData: (options) => {
      const events = compact(options.data.data?.busEvents);
      if (!events || events.length === 0) return;
      const validProposals = events
        .filter(
          (ev) =>
            ev.event.__typename === 'Proposal' &&
            ev.event.terms.__typename === 'ProposalTerms' &&
            ev.event.terms.change.__typename === 'UpdateNetworkParameter' &&
            [
              ProposalState.STATE_DECLINED,
              ProposalState.STATE_ENACTED,
              ProposalState.STATE_OPEN,
              ProposalState.STATE_PASSED,
            ].includes(ev.event.state)
        )
        .map((ev) => ev.event as Proposal);
      if (validProposals.length < 5) {
        validProposals.forEach((p) => setToast(fromProposal(p)));
      }
    },
  });

  return proposalToasts;
};
