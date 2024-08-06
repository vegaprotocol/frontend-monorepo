import { render, screen } from '@testing-library/react';

import { Splash } from './splash';

describe('Splash', () => {
  it('renders over the top of content', () => {
    render(<Splash data-testid="splash">Content</Splash>);
    expect(screen.getByTestId('splash')).toHaveClass(
      'fixed w-full h-full top-0 left-0'
    );
  });
  it('renders content', () => {
    render(<Splash data-testid="splash">Content</Splash>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
