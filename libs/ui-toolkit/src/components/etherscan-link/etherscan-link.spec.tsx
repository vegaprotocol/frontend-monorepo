import { render, screen } from '@testing-library/react';
import { EtherscanLink } from '.';

it('renders a link with the text', () => {
  render(<EtherscanLink text="foo" tx="tx" />);
  expect(screen.getByText('foo')).toBeInTheDocument();
});

it('renders a link with the tx hash if no text is provided', () => {
  render(<EtherscanLink tx="tx" />);
  expect(screen.getByText('tx')).toBeInTheDocument();
});

it('renders a link with the address if no text is provided', () => {
  render(<EtherscanLink address="address" />);
  expect(screen.getByText('address')).toBeInTheDocument();
});

it('links to etherscan address', () => {
  const hash = 'hash';
  render(<EtherscanLink address={hash} />);
  expect(screen.getByTestId('etherscan-link')).toHaveAttribute(
    'href',
    `${process.env['NX_ETHERSCAN_URL']}/address/${hash}`
  );
});

it('links to etherscan transaction', () => {
  const hash = 'hash';
  render(<EtherscanLink tx={hash} />);
  expect(screen.getByTestId('etherscan-link')).toHaveAttribute(
    'href',
    `${process.env['NX_ETHERSCAN_URL']}/tx/${hash}`
  );
});
