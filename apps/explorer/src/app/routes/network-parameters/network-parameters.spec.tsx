import { render, screen } from '@testing-library/react';
import type { NetworkParamsQuery } from '@vegaprotocol/network-parameters';
import { NetworkParametersTable } from './network-parameters';
import { MemoryRouter } from 'react-router-dom';

const renderComponent = (data: NetworkParamsQuery | undefined) => {
  return render(
    <MemoryRouter>
      <NetworkParametersTable data={data} loading={false} />
    </MemoryRouter>
  );
};

const mockData = {
  networkParametersConnection: {
    edges: [
      {
        node: {
          key: 'spam.protection.delegation.min.tokens',
          value: '3',
        },
      },
      {
        node: {
          key: 'spam.protection.voting.min.tokens',
          value: '1',
        },
      },
      {
        node: {
          key: 'reward.staking.delegation.minimumValidatorStake',
          value: '2',
        },
      },
      {
        node: {
          key: 'reward.asset',
          value:
            'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55',
        },
      },
    ],
  },
};

describe('NetworkParametersTable', () => {
  it('renders headers correctly', () => {
    renderComponent(mockData);

    const allHeadings = screen.getAllByRole('heading');
    expect(
      allHeadings.map((h) => {
        return {
          text: h.textContent,
          level: h.tagName,
          testId: h.getAttribute('data-testid'),
        };
      })
    ).toEqual([
      {
        text: 'Network Parameters',
        level: 'H1',
        testId: 'network-param-header',
      },
      { text: 'Spam', level: 'H1', testId: 'spam' },
      { text: 'Protection', level: 'H2', testId: 'spam-protection' },
      { text: 'Delegation', level: 'H3', testId: 'spam-protection-delegation' },
      { text: 'Min', level: 'H4', testId: 'spam-protection-delegation-min' },
      { text: 'Voting', level: 'H3', testId: 'spam-protection-voting' },
      { text: 'Min', level: 'H4', testId: 'spam-protection-voting-min' },
      { text: 'Reward', level: 'H1', testId: 'reward' },
      { text: 'Staking', level: 'H2', testId: 'reward-staking' },
      { text: 'Delegation', level: 'H3', testId: 'reward-staking-delegation' },
    ]);
  });

  it('renders network params correctly', () => {
    renderComponent(mockData);

    const delegationMinTokensRow = screen.getByTestId(
      'spam-protection-delegation-min-tokens'
    );
    expect(delegationMinTokensRow).toHaveTextContent('0.000000000000000003');

    const votingMinTokensRow = screen.getByTestId(
      'spam-protection-voting-min-tokens'
    );
    expect(votingMinTokensRow).toHaveTextContent('0.000000000000000001');

    const minimumValidatorStakeRow = screen.getByTestId(
      'reward-staking-delegation-minimumValidatorStake'
    );
    expect(minimumValidatorStakeRow).toHaveTextContent('2');

    const assetRow = screen.getByTestId('reward-asset');
    expect(assetRow).toHaveTextContent(
      'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55'
    );
  });

  it('does not render rows when is loading', () => {
    renderComponent(undefined);
    expect(screen.getByTestId('network-param-header')).toHaveTextContent(
      'Network Parameters'
    );
    expect(screen.queryByTestId('key-value-table-row')).not.toBeInTheDocument();
  });
});
