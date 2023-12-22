import React from 'react';
import { render, screen } from '@testing-library/react';
import { RewardHoarderBonus } from './reward-hoarder-bonus';
import type { PartyVestingStats } from '@vegaprotocol/types';

describe('RewardHoarderBonus', () => {
  it('renders null when vestingDetails is not provided', () => {
    const tiers: {
      minimum_quantum_balance: '1000';
      reward_multiplier: '1.5';
    }[] = [];
    const vestingDetails = null;
    render(
      <RewardHoarderBonus tiers={tiers} vestingDetails={vestingDetails} />
    );
    const component = screen.queryByText(/Reward bonus/i);
    expect(component).toBeNull();
  });

  it('renders null when tiers are empty', () => {
    const tiers: {
      minimum_quantum_balance: '1000';
      reward_multiplier: '1.5';
    }[] = [];
    const vestingDetails: PartyVestingStats = {
      epochSeq: 0,
      rewardBonusMultiplier: '1.5',
      quantumBalance: '100',
    };
    render(
      <RewardHoarderBonus tiers={tiers} vestingDetails={vestingDetails} />
    );
    const component = screen.queryByText(/Reward bonus/i);
    expect(component).toBeNull();
  });

  it('renders the component with tiers and vestingDetails', () => {
    const tiers = [
      {
        minimum_quantum_balance: '50',
        reward_multiplier: '1.5x',
      },
      {
        minimum_quantum_balance: '100',
        reward_multiplier: '2x',
      },
    ];
    const vestingDetails = {
      epochSeq: 0,
      rewardBonusMultiplier: '1.5',
      quantumBalance: '75',
    };
    render(
      <RewardHoarderBonus tiers={tiers} vestingDetails={vestingDetails} />
    );
    const tierLabels = screen.getAllByText(/Tier/i);
    expect(tierLabels.length).toBe(3); // 2 tiers + 1 label
  });
});
