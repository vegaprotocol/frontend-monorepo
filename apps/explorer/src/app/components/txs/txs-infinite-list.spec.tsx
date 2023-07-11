import { TxsInfiniteList } from './txs-infinite-list';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { BlockExplorerTransactionResult } from '../../routes/types/block-explorer-response';
import { Side } from '@vegaprotocol/types';
import { MockedProvider } from '@apollo/client/testing';

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
        txs={undefined as unknown as BlockExplorerTransactionResult[]}
        areTxsLoading={false}
        hasMoreTxs={false}
        loadMoreTxs={() => null}
        error={undefined}
      />
    );
    expect(screen.getByTestId('emptylist')).toBeInTheDocument();
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('item renders data of n length into list of n length', () => {
    // Provided the number of items doesn't exceed the 30 it initially
    // desires, all txs will initially render
    const txs = generateTxs(7);
    render(
      <MemoryRouter>
        <MockedProvider>
          <TxsInfiniteList
            txs={txs}
            areTxsLoading={false}
            hasMoreTxs={false}
            loadMoreTxs={() => null}
            error={undefined}
          />
        </MockedProvider>
      </MemoryRouter>
    );

    expect(
      screen
        .getByTestId('transactions-list')
        .querySelectorAll('.transaction-row')
    ).toHaveLength(7);
  });
});
