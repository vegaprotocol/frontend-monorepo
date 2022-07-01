import { render, screen, waitFor, within } from '@testing-library/react';
import { NodeList, NODES_QUERY } from './node-list';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { addDecimal } from '@vegaprotocol/react-helpers';
import type { Nodes_nodes } from './__generated__/Nodes';

jest.mock('../../components/epoch-countdown', () => ({
  EpochCountdown: () => <div data-testid="epoch-info"></div>,
}));

const nodeFactory = (overrides?: Partial<Nodes_nodes>) => ({
  id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b4',
  name: 'Skynet',
  pubkey: '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b2917',
  infoUrl: 'https://en.wikipedia.org/wiki/Skynet_(Terminator)',
  location: '',
  stakedByOperator: '3000000000000000000000',
  stakedByDelegates: '11182454495731682635157',
  stakedTotal: '14182454495731682635157',
  pendingStake: '0',
  stakedByOperatorFormatted: addDecimal(
    overrides?.stakedByOperator || '3000000000000000000000',
    18
  ),
  stakedByDelegatesFormatted: addDecimal(
    overrides?.stakedByDelegates || '11182454495731682635157',
    18
  ),
  stakedTotalFormatted: addDecimal(
    overrides?.stakedTotal || '14182454495731682635157',
    18
  ),
  pendingStakeFormatted: addDecimal(overrides?.pendingStake || '0', 18),
  epochData: null,
  status: 'Validator',
  rankingScore: {
    rankingScore: '0.67845061012234727427532760837568',
    stakeScore: '0.3392701644525644',
    performanceScore: '0.9998677767864936',
    votingPower: '2407',
    __typename: 'RankingScore',
  },
  __typename: 'Node',
  ...overrides,
});

const MOCK_NODES = {
  nodes: [
    nodeFactory(),
    nodeFactory({
      id: '966438c6bffac737cfb08173ffcb3f393c4692b099ad80cb45a82e2dc0a8cf99',
      name: 'T-800 Terminator',
      pubkey:
        'ccc3b8362c25b09d20df8ea407b0a476d6b24a0e72bc063d0033c8841652ddd4',
      infoUrl: 'https://en.wikipedia.org/wiki/Terminator_(character)',
      stakedByOperator: '3000000000000000000000',
      stakedByDelegates: '6618711883996159534058',
      stakedTotal: '9618711883996159534058',
      rankingScore: {
        rankingScore: '0.4601942440481428',
        stakeScore: '0.2300971220240714',
        performanceScore: '1',
        votingPower: '2408',
        __typename: 'RankingScore',
      },
    }),
    nodeFactory({
      id: '12c81b738e8051152e1afe44376ec37bca9216466e6d44cdd772194bad0ada81',
      name: 'NCC-1701-E',
      pubkey:
        '0931a8fd8cc935458f470e435a05414387cea6f329d648be894fcd44bd517a2b',
      infoUrl: 'https://en.wikipedia.org/wiki/USS_Enterprise_(NCC-1701-E)',
      stakedByOperator: '3000000000000000000000',
      stakedByDelegates: '1041343338923442976709',
      stakedTotal: '4041343338923442976709',
      pendingStake: '0',
      rankingScore: {
        rankingScore: '0.1932810100133910357676209647912',
        stakeScore: '0.0966762995515676',
        performanceScore: '0.999629748500531',
        votingPower: '1163',
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

const renderNodeList = () => {
  return render(
    <MemoryRouter>
      <MockedProvider
        mocks={[
          {
            request: { query: NODES_QUERY },
            result: { data: MOCK_NODES },
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
          party={{
            __typename: 'Party',
            id: 'foo',
            delegations: [
              {
                __typename: 'Delegation',
                amount: '0',
                amountFormatted: '0',
                epoch: 1,
                node: {
                  __typename: 'Node',
                  id: 'bar',
                },
              },
            ],
            stake: {
              __typename: 'PartyStake',
              currentStakeAvailable: '0',
              currentStakeAvailableFormatted: '0',
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

  it('should a lit of all nodes', async () => {
    renderNodeList();

    await waitFor(() => {
      expect(screen.getByText(MOCK_NODES.nodes[0].name)).toBeInTheDocument();
    });
    const items = screen.queryAllByTestId('node-list-item');
    expect(items).toHaveLength(3);
    for (const item of MOCK_NODES.nodes) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
  });

  it('should list the total stake and rewards of each node', async () => {
    renderNodeList();

    await waitFor(() => {
      expect(screen.getByText(MOCK_NODES.nodes[0].name)).toBeInTheDocument();
    });
    const items = screen.queryAllByTestId('node-list-item');
    const item = within(items[0]);
    const rows = item.getAllByRole('row');

    const expectedValues = [
      ['Total stake', '14,182.45 (50.94%)'],
      ['Ranking score', '0.6785'],
      ['Stake score', '0.3393'],
      ['Performance score', '0.9999'],
      ['Voting score', '2,407.0000'],
    ];

    for (const [i, r] of rows.entries()) {
      const row = within(r);
      const cell = row.getByRole('cell');
      const header = row.getByRole('rowheader');
      expect(header).toHaveTextContent(expectedValues[i][0]);
      expect(cell).toHaveTextContent(expectedValues[i][1]);
    }
  });
});
