import { render, screen } from '@testing-library/react';
import { Filters } from './proposals-list-filter';

describe('Filter', () => {
  it('renders filters', () => {
    render(<Filters />);
    expect(screen.getByTestId('proposals-filter')).toBeInTheDocument();
  });
});
