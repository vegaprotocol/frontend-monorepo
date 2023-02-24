import { t } from '@vegaprotocol/utils';
import {
  DApp,
  TOKEN_NEW_MARKET_PROPOSAL,
  useLinks,
} from '@vegaprotocol/environment';
import { ProposalsList } from '@vegaprotocol/governance';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

export const Proposed = () => {
  const tokenLink = useLinks(DApp.Token);
  const externalLink = tokenLink(TOKEN_NEW_MARKET_PROPOSAL);
  return (
    <>
      <ProposalsList />
      <ExternalLink className="py-4 px-[11px] text-sm" href={externalLink}>
        {t('Propose a new market')}
      </ExternalLink>
    </>
  );
};
