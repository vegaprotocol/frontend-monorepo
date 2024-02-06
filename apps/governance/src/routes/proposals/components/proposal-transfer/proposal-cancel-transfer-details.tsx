import { useTranslation } from 'react-i18next';
import { useCancelTransferProposalDetails } from '@vegaprotocol/proposals';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';

export const ProposalCancelTransferDetails = ({
  proposalId,
}: {
  proposalId: string;
}) => {
  const { t } = useTranslation();
  const details = useCancelTransferProposalDetails(proposalId);

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
