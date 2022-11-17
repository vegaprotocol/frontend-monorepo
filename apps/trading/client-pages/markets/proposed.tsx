import { t } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import { ProposalsList } from '@vegaprotocol/governance';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import {
  NEW_PROPOSAL_LINK,
  TOKEN_DEFAULT_DOMAIN,
} from '../../components/constants';

export const Proposed = () => {
  const { VEGA_TOKEN_URL } = useEnvironment();
  const externalLink = `${
    VEGA_TOKEN_URL || TOKEN_DEFAULT_DOMAIN
  }${NEW_PROPOSAL_LINK}`;
  return (
    <>
      <ProposalsList />
      <ExternalLink className="py-4 px-[11px] text-sm" href={externalLink}>
        {t('Propose a new market')}
      </ExternalLink>
    </>
  );
};
