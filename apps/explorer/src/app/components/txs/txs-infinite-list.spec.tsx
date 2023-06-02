import { TxsInfiniteList } from './txs-infinite-list';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { Side } from '@vegaprotocol/types';

const generateTxs = (number: number): BlockExplorerTransactionResult[] => {
  return Array.from(Array(number)).map((_) => ({
    block: '87901',
    index: 2,
    hash: '0F8B98DA0923A50786B852D9CA11E051CACC4C733E1DB93D535C7D81DBD10F6F',
    submitter:
      '4b782482f587d291e8614219eb9a5ee9280fa2c58982dee71d976782a9be1964',
    type: 'Submit Order',
    signature: {
      value: '123',
    },
    code: 0,
    cursor: '87901.2',
    command: {
      nonce: '4214037379192575529',
      blockHeight: '87898',
      orderSubmission: {
        marketId:
          'b4d0a070f5cc73a7d53b23d6f63f8cb52e937ed65d2469a3af4cc1e80e155fcf',
        price: '14525946',
        size: '54',
        side: Side.SIDE_SELL,
        timeInForce: 'TIME_IN_FORCE_GTT',
        expiresAt: '1664966445481288736',
        type: 'TYPE_LIMIT',
        reference: 'traderbot',
        peggedOrder: undefined,
      },
    },
  }));
};

describe('Txs infinite list', () => {
  it('should display a "no items" message when no items provided', () => {
    render(
      <TxsInfiniteList
        filters=""
        txs={undefined}
        areTxsLoading={false}
        hasMoreTxs={false}
        loadMoreTxs={() => null}
        error={undefined}
      />
    );
    expect(screen.getByTestId('emptylist')).toBeInTheDocument();
    expect(
      screen.getByText('This chain has 0 transactions')
    ).toBeInTheDocument();
  });

  it('error is displayed at item level', () => {
    const txs = generateTxs(1);
    render(
      <TxsInfiniteList
        filters=""
        txs={txs}
        areTxsLoading={false}
        hasMoreTxs={false}
        loadMoreTxs={() => null}
        error={Error('test error!')}
      />
    );
    expect(screen.getByText('Cannot fetch transaction')).toBeInTheDocument();
  });

  it('item renders data of n length into list of n length', () => {
    // Provided the number of items doesn't exceed the 30 it initially
    // desires, all txs will initially render
    const txs = generateTxs(7);
    render(
      <MemoryRouter>
        <TxsInfiniteList
          filters=""
          txs={txs}
          areTxsLoading={false}
          hasMoreTxs={false}
          loadMoreTxs={() => null}
          error={undefined}
        />
      </MemoryRouter>
    );

    expect(
      screen
        .getByTestId('infinite-scroll-wrapper')
        .querySelectorAll('.txs-infinite-list-item')
    ).toHaveLength(7);
  });

  it('tries to load more items when required to initially fill the list', () => {
    // For example, if initially rendering 15, the bottom of the list is
    // in view of the viewport, and the callback should be executed
    const txs = generateTxs(15);
    const callback = jest.fn();

    render(
      <MemoryRouter>
        <TxsInfiniteList
          filters=""
          txs={txs}
          areTxsLoading={false}
          hasMoreTxs={true}
          loadMoreTxs={callback}
          error={undefined}
        />
      </MemoryRouter>
    );

    expect(callback.mock.calls.length).toEqual(1);
  });

  it('does not try to load more items if there are no more', () => {
    const txs = generateTxs(3);
    const callback = jest.fn();

    render(
      <MemoryRouter>
        <TxsInfiniteList
          filters=""
          txs={txs}
          areTxsLoading={false}
          hasMoreTxs={false}
          loadMoreTxs={callback}
          error={undefined}
        />
      </MemoryRouter>
    );

    expect(callback.mock.calls.length).toEqual(0);
  });

  it('loads more items is called when scrolled', () => {
    const txs = generateTxs(14);
    const callback = jest.fn();

    render(
      <MemoryRouter>
        <TxsInfiniteList
          filters=""
          txs={txs}
          areTxsLoading={false}
          hasMoreTxs={true}
          loadMoreTxs={callback}
          error={undefined}
        />
      </MemoryRouter>
    );

    act(() => {
      fireEvent.scroll(screen.getByTestId('infinite-scroll-wrapper'), {
        target: { scrollY: 2000 },
      });
    });

    expect(callback.mock.calls.length).toEqual(1);
  });
});
