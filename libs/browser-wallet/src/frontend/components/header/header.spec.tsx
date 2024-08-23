import { render, screen } from '@testing-library/react';
import React from 'react';

import { Header, locators } from './header';

describe('Header component', () => {
  it('renders header correctly', () => {
    const content = 'My Header';
    render(<Header content={content} />);

    const headerElement = screen.getByTestId(locators.header);

    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveTextContent(content);
    expect(headerElement).toHaveClass(
      'flex',
      'justify-center',
      'flex-col',
      'text-2xl',
      'text-surface-0-fg'
    );
  });
});
