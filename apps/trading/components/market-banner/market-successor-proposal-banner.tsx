import { Fragment } from 'react';
import { MarketViewProposalFieldsFragment } from '@vegaprotocol/proposals';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { useT } from '../../lib/use-t';

export const MarketSuccessorProposalBanner = ({
  proposals,
}: {
  proposals: MarketViewProposalFieldsFragment[];
}) => {
  const t = useT();
  const tokenLink = useLinks(DApp.Governance);

  if (!proposals.length) return null;

  return (
    <div>
      <div className="uppercase mb-1">
        {proposals.length === 1
          ? t('A successor to this market has been proposed')
          : t('Successors to this market have been proposed')}
      </div>
      <div>
        {t(
          'checkOutProposalsAndVote',
          'Check out the terms of the proposals and vote:',
          {
            count: proposals.length,
          }
        )}{' '}
        {proposals.map((item, i) => {
          if (item.terms.change.__typename !== 'NewMarket') {
            return null;
          }

          const externalLink = tokenLink(
            TOKEN_PROPOSAL.replace(':id', item.id || '')
          );

          return (
            <Fragment key={i}>
              <ExternalLink href={externalLink} key={i}>
                {item.terms.change.instrument.name}
              </ExternalLink>
              {i < proposals.length - 1 && ', '}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
