import { render, screen } from '@testing-library/react';

import locators from '../locators';
import { Frame } from './frame';

describe('Frame', () => {
  it('renders border', () => {
    render(<Frame>Content</Frame>);
    expect(screen.getByTestId(locators.frame)).toHaveClass(
      'border border-vega-dark-200 rounded-lg'
    );
  });

  it('renders content', () => {
    render(<Frame>Content</Frame>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
