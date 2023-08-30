import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface ProposalsListProps {
  proposals: Array<ProposalQuery['proposal'] | ProposalFieldsFragment>;
}

export const RejectedProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');

  const filterPredicate = (
    p: ProposalFieldsFragment | ProposalQuery['proposal']
  ) =>
    p?.id?.includes(filterString) ||
    p?.party?.id?.toString().includes(filterString);

  return (
    <>
      <Heading title={t('pageTitleRejectedProposals')} />
      <ProposalsListFilter
        filterString={filterString}
        setFilterString={setFilterString}
      />
      <section>
        {proposals.length > 0 ? (
          <ul data-testid="rejected-proposals">
            {proposals.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal?.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mb-0" data-testid="no-rejected-proposals">
            {t('noRejectedProposals')}
          </p>
        )}
      </section>
    </>
  );
};
