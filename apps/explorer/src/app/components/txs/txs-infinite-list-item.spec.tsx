import { MockedProvider } from '@apollo/client/testing';
import { TxsInfiniteListItem } from './txs-infinite-list-item';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Txs infinite list item', () => {
  it('should display "missing vital data" if "type" data missing', () => {
    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          type={undefined}
          submitter="test"
          hash=""
          code={0}
          block="1"
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "hash" data missing', () => {
    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          type="test"
          submitter="test"
          hash={undefined}
          code={0}
          block="1"
          command={{}}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "submitter" data missing', () => {
    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          type="test"
          submitter={undefined}
          hash="test"
          code={0}
          block="1"
          command={{}}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "block" data missing', () => {
    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          type="test"
          submitter="test"
          hash="test"
          code={0}
          block={undefined}
          command={{}}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "code" data missing', () => {
    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          type="test"
          submitter="test"
          hash="test"
          block="1"
          command={{}}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('renders data correctly', () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <table>
            <tbody>
              <TxsInfiniteListItem
                type="testType"
                submitter="testPubKey"
                hash="testTxHash"
                block="1"
                code={0}
                command={{}}
              />
            </tbody>
          </table>
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByTestId('tx-hash')).toHaveTextContent('testTxHash');
    expect(screen.getByTestId('pub-key')).toHaveTextContent('testPubKey');
    expect(screen.getByTestId('tx-type')).toHaveTextContent('testType');
    expect(screen.getByTestId('tx-block')).toHaveTextContent('1');
  });
});
