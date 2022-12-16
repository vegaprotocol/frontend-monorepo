import { isFuture } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, SubHeading } from '../../../../components/heading';
import { ProposalsListItem } from '../proposals-list-item';
import { ProposalsListFilter } from '../proposals-list-filter';
import Routes from '../../../routes';
import { Button } from '@vegaprotocol/ui-toolkit';
import { Link } from 'react-router-dom';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import { ExternalLinks } from '@vegaprotocol/react-helpers';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';

interface ProposalsListProps {
  proposals: Array<ProposalFieldsFragment | ProposalQuery['proposal']>;
}

interface SortedProposalsProps {
  open: Array<ProposalFieldsFragment | ProposalQuery['proposal']>;
  closed: Array<ProposalFieldsFragment | ProposalQuery['proposal']>;
}

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');
  const sortedProposals = proposals.reduce(
    (acc: SortedProposalsProps, proposal) => {
      if (isFuture(new Date(proposal?.terms.closingDatetime))) {
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

  const filterPredicate = (
    p: ProposalFieldsFragment | ProposalQuery['proposal']
  ) =>
    p?.id?.includes(filterString) ||
    p?.party?.id?.toString().includes(filterString);

  return (
    <>
      <div className="grid xs:grid-cols-2 items-center">
        <Heading
          centerContent={false}
          marginBottom={false}
          title={t('pageTitleProposals')}
        />
        <Link
          className="xs:justify-self-end"
          data-testid="new-proposal-link"
          to={`${Routes.PROPOSALS}/propose`}
        >
          <Button variant="primary" size="sm">
            {t('NewProposal')}
          </Button>
        </Link>
      </div>
      <p className="mb-8">
        {t(
          `The Vega network is governed by the community. View active proposals, vote on them or propose changes to the network.`
        )}{' '}
        <ExternalLink
          data-testid="proposal-documentation-link"
          href={ExternalLinks.GOVERNANCE_PAGE}
          className="text-white"
        >
          {t(`Find out more about Vega governance`)}
        </ExternalLink>
      </p>
      {proposals.length > 0 && (
        <ProposalsListFilter setFilterString={setFilterString} />
      )}
      <section className="-mx-4 p-4 mb-8 bg-neutral-800">
        <SubHeading title={t('openProposals')} />
        {sortedProposals.open.length > 0 ? (
          <ul data-testid="open-proposals">
            {sortedProposals.open.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal?.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mb-0" data-testid="no-open-proposals">
            {t('noOpenProposals')}
          </p>
        )}
      </section>
      <section>
        <SubHeading title={t('closedProposals')} />
        {sortedProposals.closed.length > 0 ? (
          <ul data-testid="closed-proposals">
            {sortedProposals.closed.filter(filterPredicate).map((proposal) => (
              <ProposalsListItem key={proposal?.id} proposal={proposal} />
            ))}
          </ul>
        ) : (
          <p className="mb-0" data-testid="no-closed-proposals">
            {t('noClosedProposals')}
          </p>
        )}
      </section>

      <Link className="underline" to={Routes.PROPOSALS_REJECTED}>
        {t('seeRejectedProposals')}
      </Link>
    </>
  );
};
