import { render, screen } from '@testing-library/react';
import { ExplorerLink } from '.';

it('renders a link with the children', () => {
  render(<ExplorerLink entity="block">foo</ExplorerLink>);
  expect(screen.getByText('foo')).toBeInTheDocument();
});

it('renders a link with the id when no children provided', () => {
  render(<ExplorerLink entity="block" id="12345" />);
  expect(screen.getByText('12345')).toBeInTheDocument();
});

it('renders a link with the collective entity path name when no id or children provided', () => {
  render(<ExplorerLink entity="block" />);
  expect(screen.getByText('blocks')).toBeInTheDocument();
});

it('links to a block url', () => {
  const id = '12345';
  render(<ExplorerLink entity="block" id={id}></ExplorerLink>);
  expect(screen.getByTestId('explorer-link')).toHaveAttribute(
    'href',
    `${process.env['NX_EXPLORER_URL']}/blocks/${id}`
  );
});

it('links to a party url', () => {
  const id = '12345';
  render(<ExplorerLink entity="party" id={id}></ExplorerLink>);
  expect(screen.getByTestId('explorer-link')).toHaveAttribute(
    'href',
    `${process.env['NX_EXPLORER_URL']}/parties/${id}`
  );
});
