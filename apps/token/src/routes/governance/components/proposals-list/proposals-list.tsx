import { format, isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Heading } from '../../../../components/heading';
import {
  KeyValueTable,
  KeyValueTableRow,
} from '../../../../components/key-value-table';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
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

  const renderRow = (proposal: Proposals_proposals) => {
    if (!proposal || !proposal.id) return null;

    return (
      <li className="last:mb-0 mb-24" key={proposal.id}>
        <Link to={proposal.id} className="underline">
          <header>{getProposalName(proposal.terms.change)}</header>
        </Link>
        <KeyValueTable muted={true}>
          <KeyValueTableRow>
            <th>{t('state')}</th>
            <td data-testid="governance-proposal-state">
              <CurrentProposalState proposal={proposal} />
            </td>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <th>
              {isFuture(new Date(proposal.terms.closingDatetime))
                ? t('closesOn')
                : t('closedOn')}
            </th>
            <td data-testid="governance-proposal-closingDate">
              {/* {format(
                new Date(proposal.terms.closingDatetime),
                DATE_FORMAT_DETAILED
              )} */}
            </td>
          </KeyValueTableRow>
          <KeyValueTableRow>
            <th>
              {isFuture(new Date(proposal.terms.enactmentDatetime))
                ? t('proposedEnactment')
                : t('enactedOn')}
            </th>
            <td data-testid="governance-proposal-enactmentDate">
              {/* {format(
                new Date(proposal.terms.enactmentDatetime),
                DATE_FORMAT_DETAILED
              )} */}
            </td>
          </KeyValueTableRow>
        </KeyValueTable>
      </li>
    );
  };

  return (
    <>
      <Heading title={t('pageTitleGovernance')} />
      <p>{t('proposedChangesToVegaNetwork')}</p>
      <p>{t('vegaTokenHoldersCanVote')}</p>
      <p>{t('requiredMajorityDescription')}</p>
      <h2>{t('proposals')}</h2>
      <ul>{proposals.map((row) => renderRow(row))}</ul>
    </>
  );
};
