import { render, screen } from '@testing-library/react';

import { StarsWrapper } from '.';

describe('StarsWrapper', () => {
  it('renders content', () => {
    render(<StarsWrapper>Content</StarsWrapper>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
