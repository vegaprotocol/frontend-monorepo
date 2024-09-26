import { render, screen } from '@testing-library/react';
import {
  formatMinimumRunningNotionalTakerVolume,
  formatReferralDiscountFactor,
  formatReferralRewardFactor,
  formatMinimumStakedTokens,
  formatReferralRewardMultiplier,
  ProposalReferralProgramDetails,
  type ProposalReferralProgramDetailsProps,
} from './proposal-referral-program-details';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';

jest.mock('../../../../contexts/app-state/app-state-context', () => ({
  useAppState: () => ({
    appState: {
      decimals: 2,
    },
  }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ProposalReferralProgramDetails helper functions', () => {
  it('should format minimum running notional taker volume correctly', () => {
    const input = '1000';
    const formatted = formatMinimumRunningNotionalTakerVolume(input);
    expect(formatted).toBe('1,000');
  });

  it('should format referral discount factor correctly', () => {
    const input = '0.05';
    const formatted = formatReferralDiscountFactor(input);
    expect(formatted).toBe('5%');
  });

  it('should format referral reward factor correctly', () => {
    const input = '0.1';
    const formatted = formatReferralRewardFactor(input);
    expect(formatted).toBe('10%');
  });

  it('should format minimum staked tokens correctly', () => {
    const input = '15';
    const decimals = 18;
    const formatted = formatMinimumStakedTokens(input, decimals);
    expect(formatted).toBe('0.000000000000000015');
  });

  it('should format referral reward multiplier correctly', () => {
    const input = '3';
    const formatted = formatReferralRewardMultiplier(input);
    expect(formatted).toBe('3x');
  });
});

const mockChange = {
  __typename: 'UpdateReferralProgram' as const,
  benefitTiers: [
    {
      minimumEpochs: 6,
      minimumRunningNotionalTakerVolume: '10000',
      referralDiscountFactor: '0.001',
      referralRewardFactor: '0.001',
    },
    {
      minimumEpochs: 24,
      minimumRunningNotionalTakerVolume: '500000',
      referralDiscountFactor: '0.005',
      referralRewardFactor: '0.005',
    },
    {
      minimumEpochs: 48,
      minimumRunningNotionalTakerVolume: '1000000',
      referralDiscountFactor: '0.01',
      referralRewardFactor: '0.01',
    },
  ],
  endOfProgram: '2026-10-03T10:34:34Z',
  windowLength: 3,
  stakingTiers: [
    {
      minimumStakedTokens: '1',
      referralRewardMultiplier: '1',
    },
    {
      minimumStakedTokens: '2',
      referralRewardMultiplier: '2',
    },
    {
      minimumStakedTokens: '5',
      referralRewardMultiplier: '3',
    },
  ],
};

describe('<ProposalReferralProgramDetails />', () => {
  const renderComponent = (props: ProposalReferralProgramDetailsProps) => {
    return render(
      <TooltipProvider>
        <ProposalReferralProgramDetails {...props} />
      </TooltipProvider>
    );
  };
  it('should not render if proposal is null', () => {
    renderComponent({ change: null });
    expect(
      screen.queryByTestId('proposal-referral-program-details')
    ).toBeNull();
  });

  it('should not render if there are no relevant fields', () => {
    const emptyChange = {};
    // @ts-ignore change deliberately empty
    renderComponent({ change: emptyChange });
    expect(
      screen.queryByTestId('proposal-referral-program-details')
    ).toBeNull();
  });

  it('should render relevant fields if present', () => {
    renderComponent({ change: mockChange });
    expect(
      screen.getByTestId('proposal-referral-program-window-length')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('proposal-referral-program-end-of-program-timestamp')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('proposal-referral-program-benefit-tiers')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('proposal-referral-program-benefit-tiers')
    ).toBeInTheDocument();
  });
});
