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
      {sortedProposals.open.length > 0 ? (
        <ul data-testid="open-proposals">
          {sortedProposals.open.filter(filterPredicate).map((proposal) => (
            <ProposalsListItem key={proposal.id} proposal={proposal} />
          ))}
        </ul>
      ) : (
        <p data-testid="no-open-proposals">{t('noOpenProposals')}</p>
      )}
      <hr className="my-20 border-t-2" />
      {sortedProposals.closed.length > 0 ? (
        <ul data-testid="closed-proposals">
          {sortedProposals.closed.filter(filterPredicate).map((proposal) => (
            <ProposalsListItem key={proposal.id} proposal={proposal} />
          ))}
        </ul>
      ) : (
        <p data-testid="no-closed-proposals">{t('noClosedProposals')}</p>
      )}
    </>
  );
};
