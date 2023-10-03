import { useTranslation } from 'react-i18next';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import type { ProposalFieldsFragment } from '../../proposals/__generated__/Proposals';
import { useCancelTransferProposalDetails } from '@vegaprotocol/proposals';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';

export const ProposalCancelTransferDetails = ({
  proposal,
}: {
  proposal: ProposalFieldsFragment | ProposalQuery['proposal'];
}) => {
  const { t } = useTranslation();
  const details = useCancelTransferProposalDetails(proposal?.id);

  if (!details) {
    return null;
  }

  return (
    <>
      <SubHeading title={t('proposalCancelTransferDetails')} />
      <RoundedWrapper paddingBottom={true}>
        <KeyValueTable data-testid="proposal-cancel-transfer-details-table">
          <KeyValueTableRow noBorder={true}>
            {t('transferId')}
            {details.transferId}
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>
    </>
  );
};
