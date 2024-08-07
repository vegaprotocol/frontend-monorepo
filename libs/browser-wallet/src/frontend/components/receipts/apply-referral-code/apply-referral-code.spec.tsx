import { render, screen } from '@testing-library/react';

import { ApplyReferralCode, locators } from './apply-referral-code';

describe('ApplyReferralCode', () => {
  const mockTransaction = {
    applyReferralCode: {
      id: 'ABC123',
    },
  };

  it('renders referral code title correctly', () => {
    render(<ApplyReferralCode transaction={mockTransaction} />);
    const referralCodeTitle = screen.getByTestId(locators.referralCodeTitle);
    expect(referralCodeTitle).toHaveTextContent('Code');
  });

  it('renders referral code correctly', () => {
    // 1131-ARFR-001 I can see the referral code I am applying
    render(<ApplyReferralCode transaction={mockTransaction} />);
    const referralCode = screen.getByTestId(locators.referralCode);
    expect(referralCode).toHaveTextContent(
      mockTransaction.applyReferralCode.id
    );
  });
});
