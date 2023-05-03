import { isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { formatDateWithLocalTimezone } from '@vegaprotocol/utils';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { CurrentProposalState } from '../current-proposal-state';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';

interface ProposalChangeTableProps {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}

export const ProposalChangeTable = ({ proposal }: ProposalChangeTableProps) => {
  const { t } = useTranslation();

  const terms = proposal?.terms;

  return (
    <RoundedWrapper>
      <KeyValueTable data-testid="proposal-change-table">
        <KeyValueTableRow>
          {t('id')}
          {proposal?.id}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('state')}
          <CurrentProposalState proposal={proposal} />
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
        <KeyValueTableRow>
          {t('proposedOn')}
          {formatDateWithLocalTimezone(new Date(proposal?.datetime))}
        </KeyValueTableRow>
        {proposal?.rejectionReason ? (
          <KeyValueTableRow>
            {t('rejectionReason')}
            {proposal.rejectionReason}
          </KeyValueTableRow>
        ) : null}
        {proposal?.errorDetails ? (
          <KeyValueTableRow>
            {t('errorDetails')}
            {proposal.errorDetails}
          </KeyValueTableRow>
        ) : null}
        <KeyValueTableRow>
          {t('type')}
          {t(`${proposal?.terms.change.__typename}`)}
        </KeyValueTableRow>
      </KeyValueTable>
    </RoundedWrapper>
  );
};
