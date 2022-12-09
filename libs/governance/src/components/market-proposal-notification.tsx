import { t } from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import { ExternalLink, Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { useUpdateProposal } from '../lib';

type MarketProposalNotificationProps = {
  marketId?: string;
};
export const MarketProposalNotification = ({
  marketId,
}: MarketProposalNotificationProps) => {
  const tokenLink = useLinks(DApp.Token);
  const { data: proposal } = useUpdateProposal({
    id: marketId,
    proposalType: Schema.ProposalType.TYPE_UPDATE_MARKET,
  });

  if (proposal) {
    const proposalLink = tokenLink(
      TOKEN_PROPOSAL.replace(':id', proposal.id || '')
    );
    return (
      <Notification
        intent={Intent.Warning}
        message={t('Changes have been proposed for this market')}
        testId="market-proposal-notification"
      >
        <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>
      </Notification>
    );
  }

  return null;
};
