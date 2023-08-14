import { render, screen } from '@testing-library/react';
import { ExternalLink, Link } from '.';

describe('Link', () => {
  // eslint-disable-next-line
  it.skip('renders a link with a text', () => {
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

  // eslint-disable-next-line
  it.skip('renders a link with children elements', () => {
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
});

describe('ExternalLink', () => {
  it('should have an icon indicating that it is an external link', () => {
    render(<ExternalLink href="https://vega.xyz/">Go to Vega</ExternalLink>);
    const link = screen.getByTestId('external-link');
    expect(link.children.length).toEqual(2);
    expect(link.children[1].tagName.toUpperCase()).toEqual('SPAN');
  });

  it('should have an underlined text part', () => {
    render(<ExternalLink href="https://vega.xyz/">Go to Vega</ExternalLink>);
    const link = screen.getByTestId('external-link');
    expect(link.children[0]).toHaveClass('underline');
  });

  it('should not have an icon or underlined text if wrapping an element', () => {
    render(
      <ExternalLink href="https://vega.xyz/">
        <div className="inner">inner element</div>
      </ExternalLink>
    );
    const link = screen.getByTestId('external-link');
    expect(link.children.length).toEqual(1);
    expect(link.children[0]).toHaveClass('inner');
  });
});
