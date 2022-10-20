import { TxsInfiniteListItem } from './txs-infinite-list-item';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Txs infinite list item', () => {
  it('should display "missing vital data" if "type" data missing', () => {
    render(
      <TxsInfiniteListItem
        type={undefined}
        submitter="test"
        hash=""
        index={0}
        block="1"
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "hash" data missing', () => {
    render(
      <TxsInfiniteListItem
        type="test"
        submitter="test"
        hash={undefined}
        index={0}
        block="1"
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "submitter" data missing', () => {
    render(
      <TxsInfiniteListItem
        type="test"
        submitter={undefined}
        hash="test"
        index={0}
        block="1"
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "block" data missing', () => {
    render(
      <TxsInfiniteListItem
        type="test"
        submitter="test"
        hash="test"
        index={0}
        block={undefined}
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "index" data missing', () => {
    render(
      <TxsInfiniteListItem
        type="test"
        submitter="test"
        hash="test"
        index={undefined}
        block="1"
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('renders data correctly', () => {
    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          type="testType"
          submitter="testPubKey"
          hash="testTxHash"
          index={1}
          block="1"
        />
      </MemoryRouter>
    );
    expect(screen.getByTestId('tx-hash')).toHaveTextContent('testTxHash');
    expect(screen.getByTestId('pub-key')).toHaveTextContent('testPubKey');
    expect(screen.getByTestId('tx-type')).toHaveTextContent('testType');
    expect(screen.getByTestId('tx-block')).toHaveTextContent('1');
    expect(screen.getByTestId('tx-index')).toHaveTextContent('1');
  });
});
