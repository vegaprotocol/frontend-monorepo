import { render, screen } from '@testing-library/react';
import { Link } from '.';

it('renders a link with a text', () => {
  render(<Link href="">Link text</Link>);
  expect(screen.getByText('foo')).toBeInTheDocument();
});

it('renders a link with children elements', () => {
  render(<Link href="" title="My page">View page</Link>);
  expect(screen.getByText('View page')).toBeInTheDocument();
});
