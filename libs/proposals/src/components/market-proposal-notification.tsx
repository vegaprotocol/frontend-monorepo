import * as Schema from '@vegaprotocol/types';
import { ExternalLink, Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { useUpdateProposal } from '../lib';
import { useT } from '../use-t';

type MarketProposalNotificationProps = {
  marketId?: string;
};
export const MarketProposalNotification = ({
  marketId,
}: MarketProposalNotificationProps) => {
  const t = useT();
  const tokenLink = useLinks(DApp.Governance);
  const { data: proposal } = useUpdateProposal({
    id: marketId,
    proposalType: Schema.ProposalType.TYPE_UPDATE_MARKET,
  });

  if (proposal) {
    const proposalLink = tokenLink(
      TOKEN_PROPOSAL.replace(':id', proposal.id || '')
    );
    const message = (
      <div className="flex flex-col text-sm">
        {t('Changes have been proposed for this market.')}{' '}
        <ExternalLink href={proposalLink} className="w-fit">
          {t('View proposal')}
        </ExternalLink>
      </div>
    );
    return (
      <div className="border-default min-w-min whitespace-nowrap border-l pb-1 pl-1 pr-1">
        <Notification
          intent={Intent.Warning}
          message={message}
          testId="market-proposal-notification"
        />
      </div>
    );
  }

  return null;
};
