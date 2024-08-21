import {
  getScopeLabel,
  getRewardTitle,
  TransferRewards,
} from './blocks/transfer-rewards';
import { render } from '@testing-library/react';
import type { components } from '../../../../../types/explorer';
import type { Recurring } from './transfer-details';
import {
  DispatchMetric,
  DistributionStrategy,
  EntityScope,
  IndividualScope,
} from '@vegaprotocol/types';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

describe('getScopeLabel', () => {
  it('should return the correct label for ENTITY_SCOPE_TEAMS with teamScope', () => {
    const scope = 'ENTITY_SCOPE_TEAMS';
    const teamScope = ['team1', 'team2', 'team3'];
    const expectedLabel = ' 3 teams';

    const result = getScopeLabel(scope, teamScope);

    expect(result).toEqual(expectedLabel);
  });

  it('should return the correct label for ENTITY_SCOPE_TEAMS without teamScope', () => {
    const scope = 'ENTITY_SCOPE_TEAMS';
    const teamScope = undefined;
    const expectedLabel = 'All teams';

    const result = getScopeLabel(scope, teamScope);

    expect(result).toEqual(expectedLabel);
  });

  it('should return the correct label for ENTITY_SCOPE_INDIVIDUALS', () => {
    const scope = 'ENTITY_SCOPE_INDIVIDUALS';
    const teamScope = undefined;
    const expectedLabel = 'Individuals';

    const result = getScopeLabel(scope, teamScope);

    expect(result).toEqual(expectedLabel);
  });

  it('should return an empty string for unknown scope', () => {
    const scope = 'UNKNOWN_SCOPE';
    const teamScope = undefined;
    const expectedLabel = '';

    const result = getScopeLabel(
      scope as unknown as components['schemas']['vegaEntityScope'],
      teamScope
    );

    expect(result).toEqual(expectedLabel);
  });
});

describe('getRewardTitle', () => {
  it('should return the correct title for ENTITY_SCOPE_TEAMS', () => {
    const scope = 'ENTITY_SCOPE_TEAMS';
    const expectedTitle = 'Game';

    const result = getRewardTitle(scope);

    expect(result).toEqual(expectedTitle);
  });

  it('should return the correct title for other scopes', () => {
    const scope = 'ENTITY_SCOPE_INDIVIDUALS';
    const expectedTitle = 'Reward metrics';

    const result = getRewardTitle(scope);

    expect(result).toEqual(expectedTitle);
  });
});

jest.mock('../../../links');

describe('TransferRewards', () => {
  it('should render nothing if recurring dispatchStrategy is not provided', () => {
    const { container } = render(
      <TransferRewards recurring={null as unknown as Recurring} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing if recurring.dispatchStrategy is not provided', () => {
    const { container } = render(
      <TransferRewards recurring={{} as unknown as Recurring} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render the reward details correctly', () => {
    const recurring: Recurring = {
      dispatchStrategy: {
        metric: DispatchMetric.DISPATCH_METRIC_AVERAGE_POSITION,
        assetForMetric: '123',
        entityScope: EntityScope.ENTITY_SCOPE_TEAMS,
        individualScope: IndividualScope.INDIVIDUAL_SCOPE_IN_TEAM,
        teamScope: [],
        distributionStrategy:
          DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA,
        lockPeriod: 'lockPeriod',
        markets: ['market1', 'market2'],
        stakingRequirement: '1',
        windowLength: 'windowLength',
        notionalTimeWeightedAveragePositionRequirement:
          'notionalTimeWeightedAveragePositionRequirement',
        rankTable: [
          { startRank: 1, shareRatio: 0.2 },
          { startRank: 2, shareRatio: 0.3 },
        ],
        nTopPerformers: 'nTopPerformers',
      },
    };

    const { getByText } = render(
      <MemoryRouter>
        <MockedProvider>
          <TransferRewards recurring={recurring} />
        </MockedProvider>
      </MemoryRouter>
    );

    expect(getByText('Game')).toBeInTheDocument();
    expect(getByText('Scope')).toBeInTheDocument();
    expect(getByText('Asset for metric')).toBeInTheDocument();
    expect(getByText('Metric')).toBeInTheDocument();
    expect(getByText('Reward lock')).toBeInTheDocument();
    expect(getByText('Markets in scope')).toBeInTheDocument();
    expect(getByText('Staking requirement')).toBeInTheDocument();
    expect(getByText('Window length')).toBeInTheDocument();
    expect(getByText('Notional TWAP')).toBeInTheDocument();
    expect(getByText('Elligible team members:')).toBeInTheDocument();
    expect(getByText('Distribution strategy')).toBeInTheDocument();
    expect(getByText('Start rank')).toBeInTheDocument();
    expect(getByText('Share of reward pool')).toBeInTheDocument();
  });

  it('should not render a rank table if recurring.dispatchStrategy.rankTable is not provided', () => {
    const recurring: Recurring = {
      dispatchStrategy: {
        entityScope: EntityScope.ENTITY_SCOPE_INDIVIDUALS,
        teamScope: ['team1', 'team2', 'team3'],
        distributionStrategy:
          DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA,
        lockPeriod: 'lockPeriod',
        markets: ['market1', 'market2'],
        stakingRequirement: 'stakingRequirement',
        windowLength: 'windowLength',
        notionalTimeWeightedAveragePositionRequirement:
          'notionalTimeWeightedAveragePositionRequirement',
        nTopPerformers: 'nTopPerformers',
      },
    };

    const { container } = render(
      <MemoryRouter>
        <MockedProvider>
          <TransferRewards recurring={recurring} />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(container.querySelector('table')).toBeNull();
  });
});
