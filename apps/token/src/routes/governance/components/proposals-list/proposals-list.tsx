import { isFuture } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Heading } from '../../../../components/heading';
import { ProposalListItem } from '../proposals-list-item';
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

  const sortedProposals = useMemo(() => {
    const sorted = proposals.sort(
      (a, b) =>
        Date.parse(b.terms.closingDatetime) -
        Date.parse(a.terms.closingDatetime)
    );

    return sorted.reduce(
      (acc: SortedProposalsProps, proposal) => {
        if (proposal.state === 'Failed') {
          return acc;
        }
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
  }, [proposals]);

  if (proposals.length === 0) {
    return <p data-testid="no-proposals">{t('noProposals')}</p>;
  }

  return (
    <>
      <Heading title={t('pageTitleGovernance')} />
      <h2>{t('proposals')}</h2>
      {sortedProposals.open.length > 0 && (
        <>
          <ul>
            {sortedProposals.open.map((proposal) => (
              <ProposalListItem proposal={proposal} />
            ))}
          </ul>
          <hr className="my-28 border-t-2" />
        </>
      )}
      <ul>
        {sortedProposals.closed.map((proposal) => (
          <ProposalListItem proposal={proposal} />
        ))}
      </ul>
    </>
  );
};
