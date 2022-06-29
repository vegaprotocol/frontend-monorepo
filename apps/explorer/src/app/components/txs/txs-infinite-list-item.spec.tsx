import { TxsInfiniteListItem } from './txs-infinite-list-item';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Txs infinite list item', () => {
  it('should display "missing vital data" if "Type" data missing', () => {
    render(
      <TxsInfiniteListItem
        // @ts-ignore testing deliberate failure
        Type={undefined}
        Command={'test'}
        Sig={'test'}
        PubKey={'test'}
        Nonce={1}
        TxHash={'test'}
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "Command" data missing', () => {
    render(
      <TxsInfiniteListItem
        Type={'test'}
        // @ts-ignore testing deliberate failure
        Command={undefined}
        Sig={'test'}
        PubKey={'test'}
        Nonce={1}
        TxHash={'test'}
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "Pubkey" data missing', () => {
    render(
      <TxsInfiniteListItem
        Type={'test'}
        Command={'test'}
        Sig={'test'}
        // @ts-ignore testing deliberate failure
        PubKey={undefined}
        Nonce={1}
        TxHash={'test'}
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('should display "missing vital data" if "TxHash" data missing', () => {
    render(
      <TxsInfiniteListItem
        Type={'test'}
        Command={'test'}
        Sig={'test'}
        PubKey={'test'}
        Nonce={1}
        // @ts-ignore testing deliberate failure
        TxHash={undefined}
      />
    );
    expect(screen.getByText('Missing vital data')).toBeInTheDocument();
  });

  it('renders data correctly', () => {
    const testCommandData = JSON.stringify({
      test: 'test of command data',
    });

    render(
      <MemoryRouter>
        <TxsInfiniteListItem
          Type={'testType'}
          Command={testCommandData}
          Sig={'testSig'}
          PubKey={'testPubKey'}
          Nonce={1}
          TxHash={'testTxHash'}
        />
      </MemoryRouter>
    );
    expect(screen.getByTestId('tx-hash')).toHaveTextContent('testTxHash');
    expect(screen.getByTestId('pub-key')).toHaveTextContent('testPubKey');
    expect(screen.getByTestId('type')).toHaveTextContent('testType');
    const button = screen.getByTestId('command-details');
    act(() => {
      fireEvent.click(button);
    });
    expect(screen.getByText('"test of command data"')).toBeInTheDocument();
  });
});
