import { render, screen, waitFor } from '@testing-library/react';
import merge from 'lodash/merge';
import { NodeList, NODES_QUERY } from './node-list';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type { Nodes_nodes } from './__generated__/Nodes';
import type { PartialDeep } from 'type-fest';

jest.mock('../../components/epoch-countdown', () => ({
  EpochCountdown: () => <div data-testid="epoch-info"></div>,
}));

const nodeFactory = (overrides?: PartialDeep<Nodes_nodes>) => {
  const defaultNode = {
    id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b4',
    name: 'Skynet',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg',
    pubkey: '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b2917',
    infoUrl: 'https://en.wikipedia.org/wiki/Skynet_(Terminator)',
    location: '',
    stakedByOperator: '3000000000000000000000',
    stakedByDelegates: '11182454495731682635157',
    stakedTotal: '14182454495731682635157',
    stakedTotalFormatted: addDecimal('14182454495731682635157', 18),
    pendingStake: '0',
    pendingStakeFormatted: addDecimal('0', 18),
    epochData: null,
    status: 'Validator',
    rankingScore: {
      rankingScore: '0.67845061012234727427532760837568',
      stakeScore: '0.3392701644525644',
      performanceScore: '0.9998677767864936',
      votingPower: '2407',
      status: 'tendermint',
      __typename: 'RankingScore',
    },
    __typename: 'Node',
  };
  return merge(defaultNode, overrides);
};

const MOCK_NODES = {
  nodes: [
    nodeFactory(),
    nodeFactory({
      id: '966438c6bffac737cfb08173ffcb3f393c4692b099ad80cb45a82e2dc0a8cf99',
      name: 'T-800 Terminator',
      pubkey:
        'ccc3b8362c25b09d20df8ea407b0a476d6b24a0e72bc063d0033c8841652ddd4',
      stakedTotal: '9618711883996159534058',
      stakedTotalFormatted: addDecimal('9618711883996159534058', 18),
      rankingScore: {
        rankingScore: '0.4601942440481428',
        stakeScore: '0.2300971220240714',
        performanceScore: '1',
        votingPower: '2408',
        status: 'tendermint',
        __typename: 'RankingScore',
      },
    }),
    nodeFactory({
      id: '12c81b738e8051152e1afe44376ec37bca9216466e6d44cdd772194bad0ada81',
      name: 'NCC-1701-E',
      pubkey:
        '0931a8fd8cc935458f470e435a05414387cea6f329d648be894fcd44bd517a2b',
      stakedTotal: '4041343338923442976709',
      stakedTotalFormatted: addDecimal('4041343338923442976709', 18),
      pendingStake: '0',
      rankingScore: {
        rankingScore: '0.1932810100133910357676209647912',
        stakeScore: '0.0966762995515676',
        performanceScore: '0.999629748500531',
        votingPower: '1163',
        status: 'tendermint',
        __typename: 'RankingScore',
      },
    }),
  ],
  nodeData: {
    stakedTotal: '27842509718651285145924',
    stakedTotalFormatted: addDecimal('27842509718651285145924', 18),
    totalNodes: 3,
    inactiveNodes: 0,
    validatingNodes: 3,
    uptime: 1560.266845703125,
    __typename: 'NodeData',
  },
};

const renderNodeList = (data = MOCK_NODES) => {
  return render(
    <MemoryRouter>
      <MockedProvider
        mocks={[
          {
            request: { query: NODES_QUERY },
            result: { data },
          },
        ]}
      >
        <NodeList
          epoch={{
            __typename: 'Epoch',
            id: '1',
            timestamps: {
              __typename: 'EpochTimestamps',
              start: new Date(0).toISOString(),
              end: '',
              expiry: new Date(1000 * 60 * 60 * 24).toISOString(),
            },
          }}
        />
      </MockedProvider>
    </MemoryRouter>
  );
};

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Nodes list', () => {
  it('should render epoch info', async () => {
    renderNodeList();
    await waitFor(() => {
      expect(screen.getByText(MOCK_NODES.nodes[0].name)).toBeInTheDocument();
    });
    expect(screen.getByTestId('epoch-info')).toBeInTheDocument();
  });

  it('should render a list of all nodes', async () => {
    renderNodeList();

    await waitFor(() => {
      expect(screen.getByText(MOCK_NODES.nodes[0].name)).toBeInTheDocument();
      expect(screen.getByText(MOCK_NODES.nodes[1].name)).toBeInTheDocument();
      expect(screen.getByText(MOCK_NODES.nodes[2].name)).toBeInTheDocument();
    });
  });

  it('should display the correctly formatted fields in the correct columns', async () => {
    const MOCK_NODE = {
      nodes: [
        nodeFactory({
          id: '966438c6bffac737cfb08173ffcb3f393c4692b099ad80cb45a82e2dc0a8cf99',
          name: 'T-800 Terminator',
          avatarUrl:
            'https://upload.wikimedia.org/wikipedia/en/9/94/T-800_%28Model_101%29.png',
          pubkey:
            'ccc3b8362c25b09d20df8ea407b0a476d6b24a0e72bc063d0033c8841652ddd4',
          stakedTotal: '9618711883996159534058',
          stakedTotalFormatted: addDecimal('9618711883996159534058', 18),
          rankingScore: {
            rankingScore: '0.4601942440481428',
            stakeScore: '0.2300971220240714',
            performanceScore: '1',
            votingPower: '2408',
            status: 'tendermint',
            __typename: 'RankingScore',
          },
        }),
      ],
      nodeData: {
        stakedTotal: '9618711883996159534058',
        stakedTotalFormatted: addDecimal('9618711883996159534058', 18),
        totalNodes: 1,
        inactiveNodes: 0,
        validatingNodes: 1,
        uptime: 1560.266845703125,
        __typename: 'NodeData',
      },
    };

    renderNodeList(MOCK_NODE);
    await waitFor(() => {
      expect(screen.getByText(MOCK_NODE.nodes[0].name)).toBeInTheDocument();
    });

    const grid = screen.getByTestId('validators-grid');

    expect(
      grid.querySelector('[role="gridcell"][col-id="validator"]')
    ).toHaveTextContent('T-800 Terminator');

    expect(
      grid.querySelector('[role="gridcell"][col-id="validator"] img')
    ).toHaveAttribute(
      'src',
      'https://upload.wikimedia.org/wikipedia/en/9/94/T-800_%28Model_101%29.png'
    );

    expect(
      grid.querySelector('[role="gridcell"][col-id="status"]')
    ).toHaveTextContent('Consensus');

    expect(
      grid.querySelector('[role="gridcell"][col-id="totalStakeThisEpoch"]')
    ).toHaveTextContent('9,618.71');

    expect(
      grid.querySelector('[role="gridcell"][col-id="share"]')
    ).toHaveTextContent('100%');

    expect(
      grid.querySelector('[role="gridcell"][col-id="validatorStake"]')
    ).toHaveTextContent('9,618.71');

    expect(
      grid.querySelector('[role="gridcell"][col-id="pendingStake"]')
    ).toHaveTextContent('0');

    expect(
      grid.querySelector('[role="gridcell"][col-id="rankingScore"]')
    ).toHaveTextContent('0.46019');

    expect(
      grid.querySelector('[role="gridcell"][col-id="stakeScore"]')
    ).toHaveTextContent('0.23010');

    expect(
      grid.querySelector('[role="gridcell"][col-id="performanceScore"]')
    ).toHaveTextContent('1.00000');

    expect(
      grid.querySelector('[role="gridcell"][col-id="votingPower"]')
    ).toHaveTextContent('2408');
  });
});
