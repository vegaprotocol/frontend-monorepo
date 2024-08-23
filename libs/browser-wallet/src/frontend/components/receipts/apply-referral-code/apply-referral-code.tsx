import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';

export const locators = {
  referralCodeTitle: 'referral-code-title',
  referralCode: 'referral-code',
};

export const ApplyReferralCode = ({
  transaction,
}: ReceiptComponentProperties) => {
  return (
    <ReceiptWrapper>
      <h1
        className="text-surface-0-fg-muted"
        data-testid={locators.referralCodeTitle}
      >
        Code
      </h1>
      <p data-testid={locators.referralCode}>
        {transaction.applyReferralCode.id}
      </p>
    </ReceiptWrapper>
  );
};
