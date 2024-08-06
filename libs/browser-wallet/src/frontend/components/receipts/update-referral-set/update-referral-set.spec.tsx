import { render, screen } from '@testing-library/react';

import { UpdateReferralSet } from './update-referral-set';

jest.mock('../utils/referral-set-information', () => ({
  ReferralSetInformation: () => <div data-testid="referral-set-information" />,
}));

describe('UpdateReferralSet', () => {
  it('renders referral set information', () => {
    render(<UpdateReferralSet transaction={{ updateReferralSet: {} }} />);
    expect(screen.getByTestId('referral-set-information')).toBeInTheDocument();
  });
});
