import { render } from '@testing-library/react';
import { ReferralTeam } from './team';
import type { CreateReferralSet } from './team';
import { MockedProvider } from '@apollo/client/testing';

describe('ReferralTeam', () => {
  const team = {
    name: 'Test Team',
    teamUrl: 'https://example.com/team',
    avatarUrl: 'https://example.com/avatar',
    closed: false,
  };

  const mockTx: CreateReferralSet = {
    team,
  };

  const mockId = '123456';
  const mockCreator = 'JohnDoe';

  it('should render the team name', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReferralTeam tx={mockTx} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByText('Test Team')).toBeInTheDocument();
  });

  it('should render the team ID', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReferralTeam tx={mockTx} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByText('Id')).toBeInTheDocument();
    expect(getByText(mockId)).toBeInTheDocument();
  });

  it('should render the creator', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReferralTeam tx={mockTx} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByText('Creator')).toBeInTheDocument();
    expect(getByText(mockCreator)).toBeInTheDocument();
  });

  it('should render the team URL', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReferralTeam tx={mockTx} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByText('Team URL')).toBeInTheDocument();
    expect(getByText(team.teamUrl)).toBeInTheDocument();
  });

  it('should render the avatar URL', () => {
    const { getByText } = render(
      <MockedProvider>
        <ReferralTeam tx={mockTx} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByText('Avatar')).toBeInTheDocument();
    expect(getByText(team.avatarUrl)).toBeInTheDocument();
  });

  it('should render the open status as a tick if closed is falsy', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ReferralTeam tx={mockTx} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByTestId('open-yes')).toBeInTheDocument();
  });

  it('should render the open status as a cross if it is truthy', () => {
    const m = {
      team: {
        closed: true,
      },
    };

    const { getByTestId } = render(
      <MockedProvider>
        <ReferralTeam tx={m} id={mockId} creator={mockCreator} />
      </MockedProvider>
    );
    expect(getByTestId('open-no')).toBeInTheDocument();
  });
});
