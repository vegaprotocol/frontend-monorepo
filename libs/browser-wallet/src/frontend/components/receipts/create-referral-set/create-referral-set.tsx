import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';
import { ReferralSetInformation } from '../utils/referral-set-information';

export const CreateReferralSet = ({
  transaction,
}: ReceiptComponentProperties) => {
  return (
    <ReceiptWrapper>
      <ReferralSetInformation referralSetData={transaction.createReferralSet} />
    </ReceiptWrapper>
  );
};
