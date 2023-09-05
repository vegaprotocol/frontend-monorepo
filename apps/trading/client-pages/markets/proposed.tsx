import { t } from '@vegaprotocol/i18n';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { ProposalsList } from '@vegaprotocol/proposals';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

export const Proposed = () => {
  const tokenLink = useLinks(DApp.Token);
  const externalLink = tokenLink(TOKEN_NEW_MARKET_PROPOSAL);
  return (
    <>
      <div className="h-[400px]">
        <ProposalsList />
      </div>
      <ExternalLink className="py-4 px-[11px] text-sm" href={externalLink}>
        {t('Propose a new market')}
      </ExternalLink>
    </>
  );
};
