import { render, screen } from '@testing-library/react';
import { Link } from '.';

it('renders a link with a text', () => {
  render(
    <Link href="127.0.0.1" title="Link title">
      Link text
    </Link>
  );
  const link = screen.getByRole('link', { name: 'Link title' });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('data-testid', 'link');
  expect(link).toHaveAttribute('referrerPolicy', 'strict-origin');
  expect(link).toHaveAttribute('href', '127.0.0.1');
  expect(link).toHaveAttribute('title', 'Link title');
  expect(link).toHaveClass('cursor-pointer');
  expect(link).toHaveClass('underline');
});

it('renders a link with children elements', () => {
  render(
    <Link href="127.0.0.1" title="Link title">
      <span>Link text</span>
    </Link>
  );
  const link = screen.getByRole('link', { name: 'Link title' });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('data-testid', 'link');
  expect(link).toHaveAttribute('referrerPolicy', 'strict-origin');
  expect(link).toHaveAttribute('href', '127.0.0.1');
  expect(link).toHaveAttribute('title', 'Link title');
  expect(link).toHaveClass('cursor-pointer');
  expect(link).not.toHaveClass('underline');
});
