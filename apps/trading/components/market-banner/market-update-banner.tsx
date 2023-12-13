import sortBy from 'lodash/sortBy';
import { format } from 'date-fns';
import {
  DApp,
  TOKEN_PROPOSAL,
  TOKEN_PROPOSALS,
  useLinks,
} from '@vegaprotocol/environment';
import { type MarketViewProposalFieldsFragment } from '@vegaprotocol/proposals';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ProposalState } from '@vegaprotocol/types';
import { useT } from '../../lib/use-t';

export const MarketUpdateBanner = ({
  proposals,
}: {
  proposals: MarketViewProposalFieldsFragment[];
}) => {
  const governanceLink = useLinks(DApp.Governance);
  const t = useT();
  const openProposals = sortBy(
    proposals.filter((p) => p.state === ProposalState.STATE_OPEN),
    (p) => p.terms.enactmentDatetime
  );
  const passedProposals = sortBy(
    proposals.filter((p) => p.state === ProposalState.STATE_PASSED),
    (p) => p.terms.enactmentDatetime
  );

  let content = null;

  if (openProposals.length > 1) {
    content = (
      <p>
        {t('There are {{count}} open proposals to change this market', {
          count: openProposals.length,
        })}
        <ExternalLink href={governanceLink(TOKEN_PROPOSALS)}>
          {t('View proposals')}
        </ExternalLink>
      </p>
    );
  } else if (passedProposals.length) {
    const proposal = passedProposals[0];
    const proposalLink = governanceLink(
      TOKEN_PROPOSAL.replace(':id', proposal?.id || '')
    );

    content = (
      <p>
        {t('Proposal set to change market on {{date}}.', {
          date: format(new Date(proposal.terms.enactmentDatetime), 'dd MMMM'),
        })}
        <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>,
      </p>
    );
  } else {
    const proposal = openProposals[0];
    const proposalLink = governanceLink(
      TOKEN_PROPOSAL.replace(':id', proposal?.id || '')
    );
    content = (
      <p>
        {t('Changes have been proposed for this market.')}{' '}
        <ExternalLink href={proposalLink}>{t('View proposal')}</ExternalLink>
      </p>
    );
  }

  return <div data-testid="market-proposal-notification">{content}</div>;
};
