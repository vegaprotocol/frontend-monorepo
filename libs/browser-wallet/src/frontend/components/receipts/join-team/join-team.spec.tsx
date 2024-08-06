import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { JoinTeam } from './join-team';

jest.mock('@/components/vega-entities/vega-team', () => ({
  VegaTeam: () => <div data-testid="vega-team" />,
}));

jest.mock('@/components/vega-entities/team-link', () => ({
  TeamLink: () => <div data-testid="team-link" />,
}));

describe('JoinTeam', () => {
  it('returns a link to the team', () => {
    render(
      <MockNetworkProvider>
        <JoinTeam
          transaction={{
            joinTeam: {
              id: '0'.repeat(64),
            },
          }}
        />
      </MockNetworkProvider>
    );
    expect(screen.getByTestId('vega-team')).toBeInTheDocument();
    expect(screen.getByTestId('team-link')).toBeInTheDocument();
  });
});
