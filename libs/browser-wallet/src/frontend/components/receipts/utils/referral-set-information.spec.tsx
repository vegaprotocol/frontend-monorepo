import { render, screen, within } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { testingNetwork } from '../../../../config/well-known-networks';
import { locators as dataTableLocators } from '../../data-table/data-table';
import { locators as externalLinkLocators } from '../../external-link';
import locators from '../../locators';
import { locators as teamLinkLocators } from '../../vega-entities/team-link';
import { ReferralSetInformation } from './referral-set-information';

const renderComponent = ({ referralSetData }: { referralSetData: any }) => {
  return render(
    <MockNetworkProvider>
      <ReferralSetInformation referralSetData={referralSetData} />
    </MockNetworkProvider>
  );
};

describe('ReferralSetInformation', () => {
  it('renders each row', () => {
    // 1139-RFRL-001 I can see if the referral is a team or not
    // 1139-RFRL-002 If present I can see the team name
    // 1139-RFRL-003 If present I can see the team URL, with a link to that URL
    // 1139-RFRL-004 If present I can see the avatar URL, with a link to that URL
    // 1139-RFRL-005 If present I can see if the team is closed
    // 1139-RFRL-006 If present I can see the allow list, with links to explorer
    // 1139-RFRL-008 I can see the id of the team, with a link to the competitions page on console
    // 1139-RFRL-009 I can see if the referral is a team or not
    // 1139-RFRL-010 If present I can see the team name
    // 1139-RFRL-011 If present I can see the team URL, with a link to that URL
    // 1139-RFRL-012 If present I can see the avatar URL, with a link to that URL
    // 1139-RFRL-013 If present I can see if the team is closed
    // 1139-RFRL-014 If present I can see the allow list, with links to explorer
    renderComponent({
      referralSetData: {
        id: '0'.repeat(64),
        isTeam: false,
        team: {
          name: 'foo',
          teamUrl: 'https://example.com',
          avatarUrl: 'https://example2.com',
          closed: false,
          allowList: ['0'.repeat(64), '1'.repeat(64)],
        },
      },
    });
    const [id, team, name, teamUrl, avatarUrl, closed] = screen.getAllByTestId(
      dataTableLocators.dataRow
    );
    expect(id).toHaveTextContent('Id');
    expect(id).toHaveTextContent('000000…0000');
    expect(within(id).getByTestId(teamLinkLocators.teamLink)).toHaveAttribute(
      'href',
      testingNetwork.console + '/#/competitions/teams/' + '0'.repeat(64)
    );
    expect(team).toHaveTextContent('Team');
    expect(team).toHaveTextContent('No');
    expect(name).toHaveTextContent('Name');
    expect(name).toHaveTextContent('foo');
    expect(teamUrl).toHaveTextContent('Team URL');
    expect(teamUrl).toHaveTextContent('https://example.com');
    expect(
      within(teamUrl).getByTestId(externalLinkLocators.externalLink)
    ).toHaveAttribute('href', 'https://example.com');
    expect(avatarUrl).toHaveTextContent('Avatar URL');
    expect(avatarUrl).toHaveTextContent('https://example2.com');
    expect(
      within(avatarUrl).getByTestId(externalLinkLocators.externalLink)
    ).toHaveAttribute('href', 'https://example2.com');
    expect(closed).toHaveTextContent('Closed');
    expect(closed).toHaveTextContent('No');
    expect(screen.getByTestId(locators.collapsiblePanel)).toBeInTheDocument();
    const content = screen.getByTestId(locators.collapsiblePanelContent);
    expect(content).toHaveTextContent('000000…0000');
    expect(content).toHaveTextContent('111111…1111');
  });
  it('renders Yes when isTeam is true and when closed is true', () => {
    renderComponent({
      referralSetData: {
        id: '0'.repeat(64),
        isTeam: true,
        team: {
          name: 'foo',
          teamUrl: 'https://example.com',
          avatarUrl: 'https://example2.com',
          closed: true,
          allowList: ['0'.repeat(64), '1'.repeat(64)],
        },
      },
    });

    const rows = screen.getAllByTestId(dataTableLocators.dataRow);
    const team = rows[1];
    const closed = rows[5];
    expect(team).toHaveTextContent('Team');
    expect(team).toHaveTextContent('Yes');
    expect(closed).toHaveTextContent('Closed');
    expect(closed).toHaveTextContent('Yes');
  });

  it('renders id and isTeam when team is not defined', () => {
    renderComponent({
      referralSetData: {
        id: '0'.repeat(64),
        isTeam: false,
      },
    });

    const [id, team] = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(id).toHaveTextContent('Id');
    expect(id).toHaveTextContent('000000…0000');

    expect(team).toHaveTextContent('Team');
    expect(team).toHaveTextContent('No');
    expect(screen.queryByText('Team URL')).not.toBeInTheDocument();
    expect(screen.queryByText('Avatar URL')).not.toBeInTheDocument();
  });

  it('renders no public keys allowed when none are', () => {
    // 1139-RFRL-007 If there are no keys in the allowList I can see a message telling me that the allow list is empty
    // 1139-RFRL-015 If there are no keys in the allowList I can see a message telling me that the allow list is empty
    renderComponent({
      referralSetData: {
        id: '0'.repeat(64),
        isTeam: false,
        team: {
          name: 'foo',
          closed: false,
          allowList: [],
        },
      },
    });
    expect(screen.getByText('No public keys allowed')).toBeInTheDocument();
  });
});
