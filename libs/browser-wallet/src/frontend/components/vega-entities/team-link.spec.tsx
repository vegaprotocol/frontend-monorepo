import { render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { testingNetwork } from '../../../config/well-known-networks';
import { locators, TeamLink } from './team-link';

describe('TeamLink', () => {
  it('returns a link to the team', () => {
    // 1141-JNTM-001 I can see the id of the team I want to join
    // 1141-JNTM-002 I can see a link to the team's page on console
    render(
      <MockNetworkProvider>
        <TeamLink id={'0'.repeat(64)} />
      </MockNetworkProvider>
    );
    expect(screen.getByTestId(locators.teamLink)).toHaveAttribute(
      'href',
      `${testingNetwork.console}/#/competitions/teams/${'0'.repeat(64)}`
    );
    expect(screen.getByTestId(locators.teamLink)).toHaveTextContent(
      '000000…0000'
    );
  });
  it('renders name if passed in', () => {
    render(
      <MockNetworkProvider>
        <TeamLink id={'0'.repeat(64)}>Test</TeamLink>
      </MockNetworkProvider>
    );
    expect(screen.getByTestId(locators.teamLink)).toHaveAttribute(
      'href',
      `${testingNetwork.console}/#/competitions/teams/${'0'.repeat(64)}`
    );
    expect(screen.getByTestId(locators.teamLink)).toHaveTextContent('Test');
  });
});
