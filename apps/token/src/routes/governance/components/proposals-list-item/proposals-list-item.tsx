import { DATE_FORMAT_DETAILED } from '../../../../lib/date-formats';
import { format, isFuture } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { ProposalDetailHeader } from '../proposal-detail-header/proposal-detail-header';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';
import { CurrentProposalState } from '../current-proposal-state';

interface ProposalListItemProps {
  proposal: Proposals_proposals;
}

export const ProposalListItem = ({ proposal }: ProposalListItemProps) => {
  const { t } = useTranslation();
  if (!proposal || !proposal.id) return null;

  return (
    <li className="last:mb-0 mb-24" key={proposal.id}>
      <Link to={proposal.id} className="underline text-white">
        <ProposalDetailHeader proposal={proposal} />
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
