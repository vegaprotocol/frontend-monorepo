import { isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { type Proposal, type BatchProposal } from '../../types';

interface ProposalChangeTableProps {
  proposal: Proposal | BatchProposal;
}

export const ProposalChangeTable = ({ proposal }: ProposalChangeTableProps) => {
  const { t } = useTranslation();

  const closingTimeRow =
    proposal.__typename === 'Proposal' ? (
      <KeyValueTableRow>
        {isFuture(new Date(proposal.terms?.closingDatetime))
          ? t('closesOn')
          : t('closedOn')}
        {formatDateWithLocalTimezone(new Date(proposal.terms?.closingDatetime))}
      </KeyValueTableRow>
    ) : proposal.__typename === 'BatchProposal' ? (
      <KeyValueTableRow>
        {isFuture(new Date(proposal.batchTerms?.closingDatetime))
          ? t('closesOn')
          : t('closedOn')}
        {formatDateWithLocalTimezone(
          new Date(proposal.batchTerms?.closingDatetime)
        )}
      </KeyValueTableRow>
    ) : null;

  const enactmentRow =
    proposal.__typename === 'Proposal' ? (
      <KeyValueTableRow>
        {isFuture(new Date(proposal.terms?.enactmentDatetime || 0))
          ? t('proposedEnactment')
          : t('enactedOn')}
        {formatDateWithLocalTimezone(
          new Date(proposal.terms?.enactmentDatetime || 0)
        )}
      </KeyValueTableRow>
    ) : null;

  return (
    <RoundedWrapper paddingBottom={true}>
      <KeyValueTable data-testid="proposal-change-table">
        <KeyValueTableRow>
          {t('id')}
          {proposal?.id}
        </KeyValueTableRow>
        {closingTimeRow}
        {enactmentRow}
        <KeyValueTableRow>
          {t('proposedBy')}
          <span style={{ wordBreak: 'break-word' }}>{proposal?.party.id}</span>
        </KeyValueTableRow>
        <KeyValueTableRow
          noBorder={!proposal?.rejectionReason && !proposal?.errorDetails}
        >
          {t('proposedOn')}
          {formatDateWithLocalTimezone(new Date(proposal?.datetime))}
        </KeyValueTableRow>
        {proposal?.rejectionReason ? (
          <KeyValueTableRow noBorder={!proposal?.errorDetails}>
            {t('rejectionReason')}
            {proposal.rejectionReason}
          </KeyValueTableRow>
        ) : null}
        {proposal?.errorDetails ? (
          <KeyValueTableRow noBorder={true}>
            {t('errorDetails')}
            {proposal.errorDetails}
          </KeyValueTableRow>
        ) : null}
      </KeyValueTable>
    </RoundedWrapper>
  );
};
