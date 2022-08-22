import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

interface ProposalsListProps {
  proposals: Proposals_proposals[];
}

export const RejectedProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');

  const filterPredicate = (p: Proposals_proposals) =>
    p.id?.includes(filterString) ||
    p.party?.id?.toString().includes(filterString);

  return (
    <>
      <Heading title={t('pageTitleRejectedProposals')} />

      <ProposalsListFilter setFilterString={setFilterString} />

      <section className="mx-[-20px] p-20">
        {proposals.length > 0 ? (
          <ul data-testid="rejected-proposals">
            {proposals.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mt-12 mb-0" data-testid="no-rejected-proposals">
            {t('noRejectedProposals')}
          </p>
        )}
      </section>
    </>
  );
};
