import { Block } from './block';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Routes as RouteNames } from '../../route-names';
import { useFetch } from '@vegaprotocol/react-helpers';
import { MockedProvider } from '@apollo/client/testing';

jest.mock('@vegaprotocol/react-helpers', () => {
  const original = jest.requireActual('@vegaprotocol/react-helpers');
  return {
    ...original,
    useFetch: jest.fn(),
  };
});

const blockId = 1085890;

const createBlockResponse = (id: number = blockId) => {
  return {
    jsonrpc: '2.0',
    id: -1,
    result: {
      block_id: {
        hash: '26D92E4B0C892AC6EF33A281185E612671976AD9C629F6C8182C1D92C2CE2F6F',
        parts: {
          total: 1,
          hash: 'D18AEBADEAADA2C701FFFAD5A16EE8C493C5D1B54589FD1587EA5C61B7179AAC',
        },
      },
      block: {
        header: {
          version: {
            block: '11',
            app: '1',
          },
          chain_id: 'testnet-12cd7b',
          height: '1085891',
          time: '2022-03-24T11:03:40.014303953Z',
          last_block_id: {
            hash: 'C50CA169545AC1280220433D7971C50D941F675E9B0FFF358ABE8F3A7F74AE0E',
            parts: {
              total: 1,
              hash: '86974C6359B39084235EE31C1389DEA052E01E552CD1D113B3222A63A8DF390C',
            },
          },
          last_commit_hash:
            'D8FBE7DEB393D740B22EF8E91DA426494E2535902A6FB89B1D754F0DAF74DB37',
          data_hash:
            'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
          validators_hash:
            '2BC96D9FD4A7663A270909F7E604C24E1F8C87605F913F6DA55AF2DDE023BAC9',
          next_validators_hash:
            '2BC96D9FD4A7663A270909F7E604C24E1F8C87605F913F6DA55AF2DDE023BAC9',
          consensus_hash:
            '048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F',
          app_hash:
            'B04B71A61C9970A132631FFBA50E36B9C5A8A490983E803F6295133C255D3FCE',
          last_results_hash:
            'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
          evidence_hash:
            'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
          proposer_address: '1C9B6E2708F8217F8D5BFC8D8734ED9A5BC19B21',
        },
        data: {
          txs: [],
        },
        evidence: {
          evidence: [],
        },
        last_commit: {
          height: id.toString(),
          round: 0,
          block_id: {
            hash: 'C50CA169545AC1280220433D7971C50D941F675E9B0FFF358ABE8F3A7F74AE0E',
            parts: {
              total: 1,
              hash: '86974C6359B39084235EE31C1389DEA052E01E552CD1D113B3222A63A8DF390C',
            },
          },
          signatures: [
            {
              block_id_flag: 2,
              validator_address: '1C9B6E2708F8217F8D5BFC8D8734ED9A5BC19B21',
              timestamp: '2022-03-24T11:03:40.026173466Z',
              signature:
                '/BbNDfNflmhL5eNmpijxjjuLV8WJ1SkoesIThcpvxSjUhf+8tjZ+mIUkXig7xD5JB/7X23l6eEsbrBLxG6ppBA==',
            },
            {
              block_id_flag: 2,
              validator_address: '31D6EBD2A8E40524142613A241CA1D2056159EF4',
              timestamp: '2022-03-24T11:03:40.014303953Z',
              signature:
                'zJ717hzAyUN0qdfjtXHHQP05oKeGPSL5HOZ8syU6M0kj3C5fuP+IG6PdVHj26ZKthTyRhEyHcMBJ/FHu2s5MBw==',
            },
            {
              block_id_flag: 2,
              validator_address: '6DB7E2A705ABF86C6B4A4817E778669D45421166',
              timestamp: '2022-03-24T11:03:39.991116117Z',
              signature:
                'lRwyqUnIBqyyL9XHfgTdfABVT3B3T9aIb7HP656TcqOf1d1hmnZ8oZGXeKc5SNpssJSlHl9V/F9k2LZtHChKBg==',
            },
            {
              block_id_flag: 2,
              validator_address: 'A5429AF24A820AFD9C3D21507C8642F27F5DD308',
              timestamp: '2022-03-24T11:03:39.988302733Z',
              signature:
                'ARjFOJger/wlBwMap3DaMhYKe9ywkQg/rxVCLZ0MMwdhAkviC8gvZRwoDajbKuYgbsgG1MwsGk/mEib5O5cBBA==',
            },
            {
              block_id_flag: 2,
              validator_address: 'AE5B9A8193AEFC405C159C930ED2BBF40A806785',
              timestamp: '2022-03-24T11:03:40.020448546Z',
              signature:
                'o2z4gdBiNUskFQ4m/yb+uM0/jaOf1p6jpGlKoEhebn2ExreaayN/JJR8F98uWk1M4S0zK9trI9oWDgwmxo5CAg==',
            },
          ],
        },
      },
    },
  };
};

const renderComponent = (id: number = blockId) => {
  return (
    <MockedProvider>
      <MemoryRouter initialEntries={[`/${RouteNames.BLOCKS}/${id}`]}>
        <Routes>
          <Route path={`/${RouteNames.BLOCKS}/:block`} element={<Block />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(1648123348642);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('Block', () => {
  it('renders error state if error is present', async () => {
    (useFetch as jest.Mock).mockReturnValue({
      state: { data: null, loading: false, error: new Error('asd') },
    });
    render(renderComponent());

    expect(screen.getByText(`BLOCK ${blockId}`)).toBeInTheDocument();
    expect(screen.getByText('Something went wrong: asd')).toBeInTheDocument();
  });

  it('renders loading state if present', async () => {
    (useFetch as jest.Mock).mockReturnValue({
      state: { data: null, loading: true, error: null },
    });
    render(renderComponent());

    expect(screen.getByText(`BLOCK ${blockId}`)).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render title, proposer address and time mined', async () => {
    (useFetch as jest.Mock).mockReturnValue({
      state: { data: createBlockResponse(), loading: false, error: null },
    });
    render(renderComponent());
    await waitFor(() => screen.getByTestId('block-header'));
    expect(screen.getByTestId('block-header')).toHaveTextContent(
      `BLOCK ${blockId}`
    );
    const expectedValidator = '1C9B6E2708F8217F8D5BFC8D8734ED9A5BC19B21';
    const proposer = screen.getByTestId('block-validator');
    expect(proposer).toHaveTextContent(expectedValidator);
    expect(proposer).toHaveAttribute(
      'href',
      `/${RouteNames.VALIDATORS}#${expectedValidator}`
    );
    expect(screen.getByTestId('block-time')).toHaveTextContent(
      '59 minutes ago'
    );
  });

  it('renders next and previous buttons', async () => {
    (useFetch as jest.Mock).mockReturnValue({
      state: { data: createBlockResponse(), loading: false, error: null },
    });
    render(renderComponent());
    await waitFor(() => screen.getByTestId('block-header'));

    expect(screen.getByTestId('previous-block')).toHaveAttribute(
      'href',
      `/${RouteNames.BLOCKS}/${blockId - 1}`
    );
    expect(screen.getByTestId('next-block')).toHaveAttribute(
      'href',
      `/${RouteNames.BLOCKS}/${blockId + 1}`
    );
  });

  it('disables previous button on block 1', async () => {
    (useFetch as jest.Mock).mockReturnValue({
      state: { data: createBlockResponse(1), loading: false, error: null },
    });

    render(renderComponent(1));
    await waitFor(() => screen.getByTestId('block-header'));
    expect(screen.getByTestId('previous-block-button')).toHaveAttribute(
      'disabled'
    );
  });
});
