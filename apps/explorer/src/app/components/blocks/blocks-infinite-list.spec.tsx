import {
  BlocksInfiniteList,
  type BlocksInfiniteListProps,
} from './blocks-infinite-list';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';
import { MemoryRouter } from 'react-router-dom';

const generateBlocks = (number: number) => {
  return Array.from(Array(number)).map((_) => ({
    block_id: {
      hash: '1C4D61AD80C250713EB996FB19B4537283083FB1878A98DA620872EE17A2103A',
      parts: {
        total: 1,
        hash: '75A26A06BAA518A94B873229BF3A6DC5DD376A588C476B6416E181CF07F36FA1',
      },
    },
    block_size: '1965',
    header: {
      version: {
        block: '11',
      },
      chain_id: 'vega-mainnet-0006',
      height: '4993074',
      time: '2022-05-09T12:14:31.021164227Z',
      last_block_id: {
        hash: '3EA62A0EF7B668E1522EE06DC5395E2B8DE31B621C707B68D05F8AA66BD168EE',
        parts: {
          total: 1,
          hash: '5B3CD9883FFA5282FB46B0A2D7C587FDCEF2DC1660DF105B6D67649A21AEF3C7',
        },
      },
      last_commit_hash:
        '2CDC8B12074A5A4FD67B95CEB573BFC1E91A58D2E839E03B2B3FC94214100D04',
      data_hash:
        'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      validators_hash:
        'C3F329FFD2DC0B5F51D6100669BAE705647D0ED016B82AFADE38AA1723ABE9D9',
      next_validators_hash:
        'C3F329FFD2DC0B5F51D6100669BAE705647D0ED016B82AFADE38AA1723ABE9D9',
      consensus_hash:
        '048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F',
      app_hash:
        'A7FFC6F8BF1ED76651C14756A061D662F580FF4DE43B49FA82D80A4B80F8434A3237DE294EFA38CE03133F411BFE0CEE5D6948CEA838B57C475143E2BF3A3D0CA1292C11CCDB876535C6699E8217E1A1294190D83E4233ECC490D32DF17A4116ADB0E5863D3F5309179F94FD63634116788C827BE5C6163F12DA68FAA77261CD',
      last_results_hash:
        'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      evidence_hash:
        'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      proposer_address: '53D53755DA3B815AB029C0062DD6A2B392E640DC',
    },
    num_txs: '0',
  }));
};

describe('Blocks infinite list', () => {
  const renderComponent = (props: BlocksInfiniteListProps) => {
    return render(
      <MemoryRouter>
        <TooltipProvider>
          <BlocksInfiniteList {...props} />
        </TooltipProvider>
      </MemoryRouter>
    );
  };
  it('should display a "no items" message when no items provided', () => {
    renderComponent({
      blocks: undefined,
      areBlocksLoading: false,
      hasMoreBlocks: false,
      loadMoreBlocks: () => null,
      error: undefined,
    });
    expect(screen.getByTestId('emptylist')).toBeInTheDocument();
    expect(screen.getByText('This chain has 0 blocks')).toBeInTheDocument();
  });

  it('error is displayed at item level', () => {
    const blocks = generateBlocks(1);
    renderComponent({
      blocks,
      areBlocksLoading: false,
      hasMoreBlocks: false,
      loadMoreBlocks: () => null,
      error: new Error('test error!'),
    });
    expect(screen.getByText('Error: test error!')).toBeInTheDocument();
  });

  it('item renders data of n length into list of n length', () => {
    // Provided the number of items doesn't exceed the 20 it initially
    // desires, all blocks will initially render
    const blocks = generateBlocks(10);
    renderComponent({
      blocks,
      areBlocksLoading: false,
      hasMoreBlocks: false,
      loadMoreBlocks: () => null,
      error: undefined,
    });

    expect(
      screen
        .getByTestId('infinite-scroll-wrapper')
        .querySelectorAll('.block-data-table')
    ).toHaveLength(10);
  });

  it('tries to load more items when required to initially fill the list', () => {
    // For example, if initially rendering 15, the bottom of the list is
    // in view of the viewport, and the callback should be executed
    const blocks = generateBlocks(15);
    const callback = jest.fn();
    renderComponent({
      blocks,
      areBlocksLoading: false,
      hasMoreBlocks: true,
      loadMoreBlocks: callback,
      error: undefined,
    });

    expect(callback.mock.calls.length).toEqual(1);
  });

  it('does not try to load more items if there are no more', () => {
    const blocks = generateBlocks(3);
    const callback = jest.fn();

    renderComponent({
      blocks,
      areBlocksLoading: false,
      hasMoreBlocks: false,
      loadMoreBlocks: callback,
      error: undefined,
    });

    expect(callback.mock.calls.length).toEqual(0);
  });

  it('loads more items is called when scrolled', () => {
    const blocks = generateBlocks(20);
    const callback = jest.fn();

    renderComponent({
      blocks,
      areBlocksLoading: false,
      hasMoreBlocks: true,
      loadMoreBlocks: callback,
      error: undefined,
    });

    act(() => {
      fireEvent.scroll(screen.getByTestId('infinite-scroll-wrapper'), {
        target: { scrollY: 600 },
      });
    });

    expect(callback.mock.calls.length).toEqual(1);
  });
});
