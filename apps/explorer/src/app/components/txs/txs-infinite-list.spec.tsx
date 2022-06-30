import { TxsInfiniteList } from './txs-infinite-list';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const generateTxs = (number: number) => {
  return Array.from(Array(number)).map((_) => ({
    Type: 'ChainEvent',
    Command:
      '{"txId":"0xc8941ac4ea989988cb8f72e8fdab2e2009376fd17619491439d36b519d27bc93","nonce":"1494","stakingEvent":{"index":"263","block":"14805346","stakeDeposited":{"ethereumAddress":"0x2e5fe63e5d49c26998cf4bfa9b64de1cf9ae7ef2","vegaPublicKey":"657c2a8a5867c43c831e24820b7544e2fdcc1cf610cfe0ece940fe78137400fd","amount":"38471116086510047870875","blockTime":"1652968806"}}}',
    Sig: 'fe7624ab742c492cf1e667e79de4777992aca8e093c8707e1f22685c3125c6082cd21b85cd966a61ad4ca0cca2f8bed3082565caa5915bc3b2f78c1ae35cac0b',
    PubKey:
      '0x7d69327393cdfaaae50e5e215feca65273eafabfb38f32b8124e66298af346d5',
    Nonce: 18296387398179254000,
    TxHash:
      '0x9C753FA6325F7A40D9C4FA5C25E24476C54613E12B1FA2DD841E3BB00D088B77',
  }));
};

describe('Txs infinite list', () => {
  it('should display a "no items" message when no items provided', () => {
    render(
      <TxsInfiniteList
        txs={undefined}
        areTxsLoading={false}
        hasMoreTxs={false}
        loadMoreTxs={() => null}
        error={undefined}
      />
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('error is displayed at item level', () => {
    const txs = generateTxs(1);
    render(
      <TxsInfiniteList
        txs={txs}
        areTxsLoading={false}
        hasMoreTxs={false}
        loadMoreTxs={() => null}
        error={Error('test error!')}
      />
    );
    expect(screen.getByText('Error: test error!')).toBeInTheDocument();
  });

  it('item renders data of n length into list of n length', () => {
    // Provided the number of items doesn't exceed the 30 it initially
    // desires, all txs will initially render
    const txs = generateTxs(10);
    render(
      <MemoryRouter>
        <TxsInfiniteList
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
    ).toHaveLength(10);
  });

  it('tries to load more items when required to initially fill the list', () => {
    // For example, if initially rendering 15, the bottom of the list is
    // in view of the viewport, and the callback should be executed
    const txs = generateTxs(15);
    const callback = jest.fn();

    render(
      <MemoryRouter>
        <TxsInfiniteList
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
    const txs = generateTxs(20);
    const callback = jest.fn();

    render(
      <MemoryRouter>
        <TxsInfiniteList
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
        target: { scrollY: 600 },
      });
    });

    expect(callback.mock.calls.length).toEqual(1);
  });
});
