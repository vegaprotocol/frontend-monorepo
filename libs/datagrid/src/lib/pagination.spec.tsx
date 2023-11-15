import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './pagination';

describe('Pagination', () => {
  const props = {
    pageInfo: {
      hasNextPage: true,
    },
    count: 0,
    onLoad: () => undefined,
    showRetentionMessage: false,
    hasDisplayedRows: false,
  };

  it('renders message for 0 rows', async () => {
    const mockOnLoad = jest.fn();
    render(<Pagination {...props} onLoad={mockOnLoad} />);
    expect(screen.getByText('0 rows loaded')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(mockOnLoad).toHaveBeenCalled();
  });

  it('renders mesasge for multiple rows', async () => {
    const mockOnLoad = jest.fn();
    const count = 10;
    render(<Pagination {...props} count={count} onLoad={mockOnLoad} />);
    expect(screen.getByText(`${count} rows loaded`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(mockOnLoad).toHaveBeenCalled();
  });

  it('renders the data rentention message', () => {
    render(<Pagination {...props} showRetentionMessage={true} />);
    expect(screen.getByText(/data node retention/)).toBeInTheDocument();
  });

  it('renders the row filter message', () => {
    render(<Pagination {...props} count={1} hasDisplayedRows={false} />);
    expect(screen.getByText(/No rows matching/)).toBeInTheDocument();
  });
});
