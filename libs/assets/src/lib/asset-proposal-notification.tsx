import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { ExternalLink, Intent, Notification } from '@vegaprotocol/ui-toolkit';

type AssetProposalNotificationProps = {
  proposalId?: string;
};
export const AssetProposalNotification = ({
  proposalId,
}: AssetProposalNotificationProps) => {
  const tokenLink = useLinks(DApp.Governance);

  if (proposalId) {
    const proposalLink = tokenLink(
      TOKEN_PROPOSAL.replace(':id', proposalId || '')
    );
    const message = (
      <>
        {t('Changes have been proposed for this asset.')}{' '}
        <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>
      </>
    );
    return (
      <div className="mb-2">
        <Notification
          intent={Intent.Warning}
          message={message}
          testId="asset-proposal-notification"
        />
      </div>
    );
  }

  return null;
};
