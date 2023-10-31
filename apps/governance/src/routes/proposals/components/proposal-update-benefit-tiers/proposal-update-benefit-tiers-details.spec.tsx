import { render, screen } from '@testing-library/react';
import { ProposalUpdateBenefitTiers } from './proposal-update-benefit-tiers-details';
import { generateProposal } from '../../test-helpers/generate-proposals';

jest.mock('../../../../contexts/app-state/app-state-context', () => ({
  useAppState: () => ({
    appState: {
      decimals: 2,
    },
  }),
}));

const mockVestingBenefitTierProposal = generateProposal({
  terms: {
    change: {
      __typename: 'UpdateNetworkParameter',
      networkParameter: {
        key: 'blah.blah.benefitTiers',
        value: JSON.stringify({
          tiers: [
            {
              minimum_quantum_balance: '10000',
              reward_multiplier: '0.05',
            },
            {
              minimum_quantum_balance: '500000000000',
              reward_multiplier: '0.1',
            },
            {
              minimum_quantum_balance: '10000000000000',
              reward_multiplier: '10',
            },
          ],
        }),
      },
    },
  },
});

const mockActivityStreakBenefitTierProposal = generateProposal({
  terms: {
    change: {
      __typename: 'UpdateNetworkParameter',
      networkParameter: {
        key: 'blah.blah.benefitTiers',
        value: JSON.stringify({
          tiers: [
            {
              minimum_activity_streak: '10000',
              vesting_multiplier: '5',
              reward_multiplier: '0.1',
            },
            {
              minimum_activity_streak: '10000000000000',
              vesting_multiplier: '100',
              reward_multiplier: '10',
            },
          ],
        }),
      },
    },
  },
});
describe('ProposalUpdateBenefitTiers', () => {
  it('should not render if proposal is null', () => {
    render(<ProposalUpdateBenefitTiers proposal={null} />);
    expect(screen.queryByTestId('proposal-update-benefit-tiers')).toBeNull();
  });

  it('should not render if __typename is not UpdateNetworkParameter', () => {
    const updateMarketProposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateMarket',
        },
      },
    });
    render(<ProposalUpdateBenefitTiers proposal={updateMarketProposal} />);
    expect(screen.queryByTestId('proposal-update-benefit-tiers')).toBeNull();
  });

  it('should not render if there are no relevant fields', () => {
    const incompleteProposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateNetworkParameter',
        },
      },
    });

    render(<ProposalUpdateBenefitTiers proposal={incompleteProposal} />);
    expect(screen.queryByTestId('proposal-update-benefit-tiers')).toBeNull();
  });

  it('should not render if there are relevant fields that are empty', () => {
    const incompleteProposal = generateProposal({
      terms: {
        change: {
          __typename: 'UpdateNetworkParameter',
          networkParameter: {
            key: 'blah.blah.benefitTiers',
            value: JSON.stringify({}),
          },
        },
      },
    });

    render(<ProposalUpdateBenefitTiers proposal={incompleteProposal} />);
    expect(screen.queryByTestId('proposal-update-benefit-tiers')).toBeNull();
  });

  it('should render a valid vesting benefit tier proposal', () => {
    render(
      <ProposalUpdateBenefitTiers proposal={mockVestingBenefitTierProposal} />
    );

    // 3 tiers in the sample data
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
    expect(screen.getByText('Tier 2')).toBeInTheDocument();
    expect(screen.getByText('Tier 3')).toBeInTheDocument();

    expect(screen.getAllByText('Minimum quantum balance').length).toBe(3);
    expect(screen.getAllByText('Reward multiplier').length).toBe(3);

    expect(screen.getByText('0.00000000000001')).toBeInTheDocument();
    expect(screen.getByText('0.05x')).toBeInTheDocument();

    expect(screen.getByText('0.0000005')).toBeInTheDocument();
    expect(screen.getByText('0.1x')).toBeInTheDocument();

    expect(screen.getByText('0.00001')).toBeInTheDocument();
    expect(screen.getByText('10x')).toBeInTheDocument();
  });

  it('should render a valid activity streak benefit tier proposal', () => {
    render(
      <ProposalUpdateBenefitTiers
        proposal={mockActivityStreakBenefitTierProposal}
      />
    );

    // 3 tiers in the sample data
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
    expect(screen.getByText('Tier 2')).toBeInTheDocument();

    expect(screen.getAllByText('Minimum activity streak').length).toBe(2);
    expect(screen.getAllByText('Vesting multiplier').length).toBe(2);
    expect(screen.getAllByText('Reward multiplier').length).toBe(2);

    expect(screen.getByText('10000')).toBeInTheDocument();
    expect(screen.getByText('5x')).toBeInTheDocument();
    expect(screen.getByText('0.1x')).toBeInTheDocument();

    expect(screen.getByText('10000000000000')).toBeInTheDocument();
    expect(screen.getByText('100x')).toBeInTheDocument();
    expect(screen.getByText('10x')).toBeInTheDocument();
  });
});
