import { format, isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';
import { CurrentProposalState } from '../current-proposal-state';

interface ProposalChangeTableProps {
  proposal: Proposals_proposals;
}

export const ProposalChangeTable = ({ proposal }: ProposalChangeTableProps) => {
  const { t } = useTranslation();

  const terms = proposal.terms;

  return (
    <KeyValueTable data-testid="proposal-change-table">
      <KeyValueTableRow muted={true}>
        <th>{t('id')}</th>
        <td>{proposal.id}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true}>
        <th>{t('state')}</th>
        <td>
          <CurrentProposalState proposal={proposal} />
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true}>
        <th>
          {isFuture(new Date(terms.closingDatetime))
            ? t('closesOn')
            : t('closedOn')}
        </th>
        <td>{format(new Date(terms.closingDatetime), DATE_FORMAT_DETAILED)}</td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true}>
        <th>
          {isFuture(new Date(terms.enactmentDatetime))
            ? t('proposedEnactment')
            : t('enactedOn')}
        </th>
        <td>
          {format(new Date(terms.enactmentDatetime), DATE_FORMAT_DETAILED)}
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true}>
        <th>{t('proposedBy')}</th>
        <td>
          <span style={{ wordBreak: 'break-word' }}>{proposal.party.id}</span>
        </td>
      </KeyValueTableRow>
      <KeyValueTableRow muted={true}>
        <th>{t('proposedOn')}</th>
        <td>{format(new Date(proposal.datetime), DATE_FORMAT_DETAILED)}</td>
      </KeyValueTableRow>
      {proposal.rejectionReason ? (
        <KeyValueTableRow muted={true}>
          <th>{t('rejectionReason')}</th>
          <td>{proposal.rejectionReason}</td>
        </KeyValueTableRow>
      ) : null}
      {proposal.errorDetails ? (
        <KeyValueTableRow muted={true}>
          <th>{t('errorDetails')}</th>
          <td>{proposal.errorDetails}</td>
        </KeyValueTableRow>
      ) : null}
      <KeyValueTableRow muted={true}>
        <th>{t('type')}</th>
        <td>{proposal.terms.change.__typename}</td>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
