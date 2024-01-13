import { isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface ProposalChangeTableProps {
  proposal:
    | ProposalFieldsFragment
    | Extract<ProposalQuery['proposal'], { __typename?: 'Proposal' }>;
}

export const ProposalChangeTable = ({ proposal }: ProposalChangeTableProps) => {
  const { t } = useTranslation();

  const terms = proposal?.terms;

  return (
    <RoundedWrapper paddingBottom={true}>
      <KeyValueTable data-testid="proposal-change-table">
        <KeyValueTableRow>
          {t('id')}
          {proposal?.id}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {isFuture(new Date(terms?.closingDatetime))
            ? t('closesOn')
            : t('closedOn')}
          {formatDateWithLocalTimezone(new Date(terms?.closingDatetime))}
        </KeyValueTableRow>
        {terms?.change.__typename !== 'NewFreeform' ? (
          <KeyValueTableRow>
            {isFuture(new Date(terms?.enactmentDatetime || 0))
              ? t('proposedEnactment')
              : t('enactedOn')}
            {formatDateWithLocalTimezone(
              new Date(terms?.enactmentDatetime || 0)
            )}
          </KeyValueTableRow>
        ) : null}
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
