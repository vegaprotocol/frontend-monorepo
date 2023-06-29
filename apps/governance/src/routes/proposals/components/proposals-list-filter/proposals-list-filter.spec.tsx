import { render, fireEvent, screen } from '@testing-library/react';
import { ProposalsListFilter } from './proposals-list-filter';

describe('ProposalsListFilter', () => {
  let setFilterString: jest.Mock;

  beforeEach(() => {
    setFilterString = jest.fn();
    render(
      <ProposalsListFilter filterString="" setFilterString={setFilterString} />
    );
  });

  it('renders successfully', () => {
    expect(screen.getByTestId('proposals-list-filter')).toBeInTheDocument();
  });

  it('should handle the filter toggle click', () => {
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    expect(screen.getByTestId('proposals-list-filter')).toBeInTheDocument();
  });

  it('should handle input change', () => {
    fireEvent.click(screen.getByTestId('proposal-filter-toggle'));
    fireEvent.change(screen.getByTestId('filter-input'), {
      target: { value: 'test' },
    });

    expect(setFilterString).toHaveBeenCalledWith('test');
  });

  // 'clear filter' tests are handled in the proposals-list.spec.tsx file
  // as it is responsible for the filter state
});
