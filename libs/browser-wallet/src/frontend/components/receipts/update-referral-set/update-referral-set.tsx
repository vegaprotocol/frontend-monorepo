import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';
import { ReferralSetInformation } from '../utils/referral-set-information';

export const UpdateReferralSet = ({
  transaction,
}: ReceiptComponentProperties) => {
  return (
    <ReceiptWrapper>
      <ReferralSetInformation referralSetData={transaction.updateReferralSet} />
    </ReceiptWrapper>
  );
};
