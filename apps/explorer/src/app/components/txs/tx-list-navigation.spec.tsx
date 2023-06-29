import { render, screen, fireEvent } from '@testing-library/react';
import { TxsListNavigation } from './tx-list-navigation';

const NOOP = () => {
  return;
};
describe('TxsListNavigation', () => {
  it('renders transaction list navigation', () => {
    render(
      <TxsListNavigation
        refreshTxs={NOOP}
        nextPage={NOOP}
        previousPage={NOOP}
        hasMoreTxs={true}
        hasPreviousPage={true}
      >
        <span></span>
      </TxsListNavigation>
    );

    expect(screen.getByText('Newer')).toBeInTheDocument();
    expect(screen.getByText('Older')).toBeInTheDocument();
  });

  it('calls previousPage when "Newer" button is clicked', () => {
    const previousPageMock = jest.fn();

    render(
      <TxsListNavigation
        refreshTxs={NOOP}
        nextPage={NOOP}
        previousPage={previousPageMock}
        hasMoreTxs={true}
        hasPreviousPage={true}
      >
        <span></span>
      </TxsListNavigation>
    );

    fireEvent.click(screen.getByText('Newer'));

    expect(previousPageMock).toHaveBeenCalledTimes(1);
  });

  it('calls nextPage when "Older" button is clicked', () => {
    const nextPageMock = jest.fn();

    render(
      <TxsListNavigation
        refreshTxs={NOOP}
        nextPage={nextPageMock}
        previousPage={NOOP}
        hasMoreTxs={true}
        hasPreviousPage={true}
      >
        <span></span>
      </TxsListNavigation>
    );

    fireEvent.click(screen.getByText('Older'));

    expect(nextPageMock).toHaveBeenCalledTimes(1);
  });

  it('disables "Older" button if hasMoreTxs is false', () => {
    render(
      <TxsListNavigation
        refreshTxs={NOOP}
        nextPage={NOOP}
        previousPage={NOOP}
        hasMoreTxs={false}
        hasPreviousPage={false}
      >
        <span></span>
      </TxsListNavigation>
    );

    expect(screen.getByText('Older')).toBeDisabled();
  });

  it('disables "Newer" button if hasPreviousPage is false', () => {
    render(
      <TxsListNavigation
        refreshTxs={NOOP}
        nextPage={NOOP}
        previousPage={NOOP}
        hasMoreTxs={true}
        hasPreviousPage={false}
      >
        <span></span>
      </TxsListNavigation>
    );

    expect(screen.getByText('Newer')).toBeDisabled();
  });

  it('disables both buttons when more and previous are false', () => {
    render(
      <TxsListNavigation
        refreshTxs={NOOP}
        nextPage={NOOP}
        previousPage={NOOP}
        hasMoreTxs={false}
        hasPreviousPage={false}
      >
        <span></span>
      </TxsListNavigation>
    );

    expect(screen.getByText('Newer')).toBeDisabled();
    expect(screen.getByText('Older')).toBeDisabled();
  });
});
