import { isFuture } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

interface ProposalsListProps {
  proposals: Proposals_proposals[];
}

interface SortedProposalsProps {
  open: Proposals_proposals[];
  closed: Proposals_proposals[];
}

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');

  const failedProposalsCulled = proposals.filter(
    ({ state }) => state !== 'Failed'
  );

  const sortedProposals = failedProposalsCulled.reduce(
    (acc: SortedProposalsProps, proposal) => {
      if (isFuture(new Date(proposal.terms.closingDatetime))) {
        acc.open.push(proposal);
      } else {
        acc.closed.push(proposal);
      }
      return acc;
    },
    {
      open: [],
      closed: [],
    }
  );

  const filterPredicate = (p: Proposals_proposals) =>
    p.id?.includes(filterString) ||
    p.party?.id?.toString().includes(filterString);

  return (
    <>
      <Heading title={t('pageTitleGovernance')} />
      {failedProposalsCulled.length > 0 && (
        <ProposalsListFilter setFilterString={setFilterString} />
      )}

      <section className="mx-[-20px] p-20 bg-white-10">
        <h2 className="text-h4 mb-0">{t('openProposals')}</h2>
        {sortedProposals.open.length > 0 ? (
          <ul data-testid="open-proposals">
            {sortedProposals.open.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mt-12 mb-0" data-testid="no-open-proposals">
            {t('noOpenProposals')}
          </p>
        )}
      </section>

      <section className="mx-[-20px] p-20">
        <h2 className="text-h4 mb-0">{t('closedProposals')}</h2>
        {sortedProposals.closed.length > 0 ? (
          <ul data-testid="closed-proposals">
            {sortedProposals.closed.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mt-12 mb-0" data-testid="no-closed-proposals">
            {t('noClosedProposals')}
          </p>
        )}
      </section>
    </>
  );
};
