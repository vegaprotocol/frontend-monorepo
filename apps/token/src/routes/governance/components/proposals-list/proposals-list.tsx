import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import { format, isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Heading } from '../../../../components/heading';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { getProposalName } from '../../../../lib/type-policies/proposal';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';
import { CurrentProposalState } from '../current-proposal-state';

interface ProposalsListProps {
  proposals: Proposals_proposals[];
}

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();

  if (proposals.length === 0) {
    return <p>{t('noProposals')}</p>;
  }

  return (
    <>
      <Heading title={t('pageTitleGovernance')} />
      <h2>{t('proposals')}</h2>
      <ul>
        {proposals.map((proposal) => (
          <ProposalListItem proposal={proposal} />
        ))}
      </ul>
    </>
  );
};

interface ProposalListItemProps {
  proposal: Proposals_proposals;
}

const ProposalListItem = ({ proposal }: ProposalListItemProps) => {
  const { t } = useTranslation();
  if (!proposal || !proposal.id) return null;

  return (
    <li className="last:mb-0 mb-24" key={proposal.id}>
      <Link to={proposal.id} className="underline text-white">
        <header>{getProposalName(proposal)}</header>
      </Link>
      <KeyValueTable muted={true}>
        <KeyValueTableRow>
          {t('state')}
          <span data-testid="governance-proposal-state">
            <CurrentProposalState proposal={proposal} />
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {isFuture(new Date(proposal.terms.closingDatetime))
            ? t('closesOn')
            : t('closedOn')}

          <span data-testid="governance-proposal-closingDate">
            {format(
              new Date(proposal.terms.closingDatetime),
              DATE_FORMAT_DETAILED
            )}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {isFuture(new Date(proposal.terms.enactmentDatetime))
            ? t('proposedEnactment')
            : t('enactedOn')}

          <span data-testid="governance-proposal-enactmentDate">
            {format(
              new Date(proposal.terms.enactmentDatetime),
              DATE_FORMAT_DETAILED
            )}
          </span>
        </KeyValueTableRow>
      </KeyValueTable>
    </li>
  );
};
