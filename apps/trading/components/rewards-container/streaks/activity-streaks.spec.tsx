import { render, screen } from '@testing-library/react';
import { ActivityStreak } from './activity-streaks';

describe('ActivityStreak', () => {
  it('renders null when streak is not active', () => {
    const tiers: {
      minimum_activity_streak: number;
      reward_multiplier: string;
      vesting_multiplier: string;
    }[] = [];
    const streak = null;
    render(<ActivityStreak tiers={tiers} streak={streak} />);
    const component = screen.queryByText(/epochs streak/i);
    expect(component).toBeNull();
  });

  it('renders null when tiers are empty', () => {
    const tiers: {
      minimum_activity_streak: number;
      reward_multiplier: string;
      vesting_multiplier: string;
    }[] = [];
    const streak = {
      activeFor: 10,
      isActive: true,
      inactiveFor: 10,
      rewardDistributionMultiplier: '45678',
      rewardVestingMultiplier: '45678',
      epoch: 10,
      tradedVolume: '45678',
      openVolume: '45678',
    };
    render(<ActivityStreak tiers={tiers} streak={streak} />);
    const component = screen.queryByText(/epochs streak/i);
    expect(component).toBeNull();
  });

  it('renders the component with tiers and active streak', () => {
    const tiers = [
      {
        minimum_activity_streak: 5,
        reward_multiplier: '1.5x',
        vesting_multiplier: '2x',
      },
      {
        minimum_activity_streak: 10,
        reward_multiplier: '2x',
        vesting_multiplier: '3x',
      },
    ];
    const streak = {
      activeFor: 7,
      isActive: true,
      inactiveFor: 10,
      rewardDistributionMultiplier: '45678',
      rewardVestingMultiplier: '45678',
      epoch: 10,
      tradedVolume: '45678',
      openVolume: '45678',
    };
    render(<ActivityStreak tiers={tiers} streak={streak} />);

    const tierLabels = screen.getAllByText(/Tier/i);
    expect(tierLabels.length).toBe(3); // 2 tiers + 1 label
  });
});
