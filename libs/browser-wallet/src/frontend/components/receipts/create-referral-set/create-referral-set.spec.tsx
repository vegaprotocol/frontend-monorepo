import { render, screen } from '@testing-library/react';

import { CreateReferralSet } from './create-referral-set';

jest.mock('../utils/referral-set-information', () => ({
  ReferralSetInformation: () => <div data-testid="referral-set-information" />,
}));

describe('CreateReferralSet', () => {
  it('renders referral set information', () => {
    render(<CreateReferralSet transaction={{ updateReferralSet: {} }} />);
    expect(screen.getByTestId('referral-set-information')).toBeInTheDocument();
  });
});
