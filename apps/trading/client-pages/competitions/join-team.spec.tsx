import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinButton } from './join-team';
import { type Team } from './hooks/use-team';

describe('JoinButton', () => {
  const teamA = {
    teamId: 'teamA',
    name: 'Team A',
    referrer: 'referrerA',
  } as Team;

  const teamB = {
    teamId: 'teamB',
    name: 'Team B',
    referrer: 'referrerrB',
  } as Team;

  const props = {
    pubKey: 'pubkey',
    isReadOnly: false,
    team: teamA,
    partyTeam: teamB,
    onJoin: jest.fn(),
  };

  beforeEach(() => {
    props.onJoin.mockClear();
  });

  it('disables button if not connected', async () => {
    render(<JoinButton {...props} pubKey={null} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(/Connect your wallet/);
  });

  it('disables button if you created the current team', () => {
    render(
      <JoinButton
        {...props}
        pubKey={teamA.referrer}
        team={teamA}
        partyTeam={teamA}
      />
    );

    const button = screen.getByRole('button', { name: /Owner/ });
    expect(button).toBeDisabled();
  });

  it('disables button if you created a team', async () => {
    render(<JoinButton {...props} pubKey={teamB.referrer} />);

    const button = screen.getByRole('button', { name: /Switch team/ });
    expect(button).toBeDisabled();
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent(/As a team creator/);
  });

  it('shows if party is already in team', async () => {
    render(<JoinButton {...props} team={teamA} partyTeam={teamA} />);

    const button = screen.getByRole('button', { name: /Joined/ });
    expect(button).toBeDisabled();
  });

  it('enables switch team if party is in a different team', async () => {
    render(<JoinButton {...props} />);

    const button = screen.getByRole('button', { name: /Switch team/ });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(props.onJoin).toHaveBeenCalledWith('switch');
  });

  it('enables join team if party is not in a team', async () => {
    render(<JoinButton {...props} partyTeam={undefined} />);

    const button = screen.getByRole('button', { name: /Join team/ });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(props.onJoin).toHaveBeenCalledWith('join');
  });
});
