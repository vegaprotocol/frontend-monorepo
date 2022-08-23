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
    <KeyValueTable data-testid="proposal-change-table" muted={true}>
      <KeyValueTableRow>
        {t('id')}
        {proposal.id}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('state')}
        <CurrentProposalState proposal={proposal} />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {isFuture(new Date(terms.closingDatetime))
          ? t('closesOn')
          : t('closedOn')}
        {format(new Date(terms.closingDatetime), DATE_FORMAT_DETAILED)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {isFuture(new Date(terms.enactmentDatetime || 0))
          ? t('proposedEnactment')
          : t('enactedOn')}
        {format(new Date(terms.enactmentDatetime || 0), DATE_FORMAT_DETAILED)}
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('proposedBy')}
        <span style={{ wordBreak: 'break-word' }}>{proposal.party.id}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('proposedOn')}
        {format(new Date(proposal.datetime), DATE_FORMAT_DETAILED)}
      </KeyValueTableRow>
      {proposal.rejectionReason ? (
        <KeyValueTableRow>
          {t('rejectionReason')}
          {proposal.rejectionReason}
        </KeyValueTableRow>
      ) : null}
      {proposal.errorDetails ? (
        <KeyValueTableRow>
          {t('errorDetails')}
          {proposal.errorDetails}
        </KeyValueTableRow>
      ) : null}
      <KeyValueTableRow>
        {t('type')}
        {proposal.terms.change.__typename}
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
