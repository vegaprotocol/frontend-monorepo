import { render, screen } from '@testing-library/react';
import { TxsFilter } from './tx-filter';
import type { FilterOption } from './tx-filter';

describe('TxsFilter', () => {
  it('renders holding text when nothing is selected', () => {
    const filters: Set<FilterOption> = new Set([]);
    const setFilters = jest.fn();
    render(<TxsFilter filters={filters} setFilters={setFilters} />);
    expect(screen.getByTestId('filter-empty')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders the submit order filter as selected', () => {
    const filters: Set<FilterOption> = new Set(['Submit Order']);
    const setFilters = jest.fn();
    render(<TxsFilter filters={filters} setFilters={setFilters} />);
    expect(screen.getByTestId('filter-selected')).toBeInTheDocument();
    expect(screen.getByText('Submit Order')).toBeInTheDocument();
  });
});
