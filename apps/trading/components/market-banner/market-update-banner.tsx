import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Trans } from 'react-i18next';

export const MarketUpdateBanner = ({
  proposal,
}: {
  proposal: { id: string };
}) => {
  const tokenLink = useLinks(DApp.Governance);
  const proposalLink = tokenLink(TOKEN_PROPOSAL.replace(':id', proposal.id));
  return (
    <p data-testid="market-proposal-notification">
      <Trans
        i18nKey="Changes have been proposed for this market. <0>View proposals</0>"
        components={[
          <ExternalLink key="view-link" href={proposalLink}>
            View proposals
          </ExternalLink>,
        ]}
      />
    </p>
  );
};
