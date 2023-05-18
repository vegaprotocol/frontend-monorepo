import { render, screen } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { VoteProgress } from './voting-progress';

it('Renders with data-testid', () => {
  render(
    <VoteProgress threshold={new BigNumber(50)} progress={new BigNumber(10)} />
  );
  expect(screen.getByTestId('vote-progress')).toBeInTheDocument();
});

it('Renders indicator', () => {
  render(
    <VoteProgress threshold={new BigNumber(50)} progress={new BigNumber(10)} />
  );
  expect(screen.getByTestId('vote-progress-indicator')).toBeInTheDocument();
});

it('Renders widths appropriately', () => {
  render(
    <VoteProgress threshold={new BigNumber(50)} progress={new BigNumber(10)} />
  );
  expect(screen.getByTestId('vote-progress-bar-for')).toHaveStyle({
    width: '10%',
  });
  expect(screen.getByTestId('vote-progress-bar-against')).toHaveStyle({
    width: '90%',
  });
});
