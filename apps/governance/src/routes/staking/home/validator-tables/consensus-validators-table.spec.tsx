import merge from 'lodash/merge';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConsensusValidatorsTable } from './consensus-validators-table';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { NodesDocument } from '../__generated__/Nodes';
import { PreviousEpochDocument } from '../../__generated__/PreviousEpoch';
import * as Schema from '@vegaprotocol/types';
import { AppStateProvider } from '../../../../contexts/app-state/app-state-provider';
import type { MockedResponse } from '@apollo/client/testing';
import type { PartialDeep } from 'type-fest';
import type { NodesFragmentFragment } from '../__generated__/Nodes';
import type { PreviousEpochQuery } from '../../__generated__/PreviousEpoch';
import type { ValidatorsView } from './validator-tables';

const nodeFactory = (
  overrides?: PartialDeep<NodesFragmentFragment>
): NodesFragmentFragment => {
  const defaultNode: NodesFragmentFragment = {
    id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b4',
    name: 'high',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/Marvin-TV-3.jpg',
    pubkey: '6abc23391a9f888ab240415bf63d6844b03fc360be822f4a1d2cd832d87b2917',
    stakedTotal: '14182454495731682635157',
    stakedByOperator: '1000000000000000000000',
    stakedByDelegates: '13182454495731682635157',
    pendingStake: '0',
    rankingScore: {
      rankingScore: '0.67845061012234727427532760837568',
      stakeScore: '0.3392701644525644',
      performanceScore: '0.9998677767864936',
      votingPower: '3500',
      status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
      __typename: 'RankingScore',
    },
    __typename: 'Node',
  };
  return merge(defaultNode, overrides);
};

const MOCK_NODES = [
  nodeFactory(),
  nodeFactory({
    id: '966438c6bffac737cfb08173ffcb3f393c4692b099ad80cb45a82e2dc0a8cf99',
    name: 'medium',
    pubkey: 'ccc3b8362c25b09d20df8ea407b0a476d6b24a0e72bc063d0033c8841652ddd4',
    stakedTotal: '9618711883996159534058',
    rankingScore: {
      rankingScore: '0.4601942440481428',
      stakeScore: '0.2300971220240714',
      performanceScore: '1',
      votingPower: '2408',
      status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
      __typename: 'RankingScore',
    },
  }),
  nodeFactory({
    id: '12c81b738e8051152e1afe44376ec37bca9216466e6d44cdd772194bad0ada81',
    name: 'low',
    pubkey: '0931a8fd8cc935458f470e435a05414387cea6f329d648be894fcd44bd517a2b',
    stakedTotal: '4041343338923442976709',
    pendingStake: '0',
    rankingScore: {
      rankingScore: '0.1932810100133910357676209647912',
      stakeScore: '0.0966762995515676',
      performanceScore: '0.999629748500531',
      votingPower: '1163',
      status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
      __typename: 'RankingScore',
    },
  }),
];

const MOCK_PREVIOUS_EPOCH: PreviousEpochQuery = {
  epoch: {
    id: '1',
    validatorsConnection: {
      edges: [
        {
          node: {
            id: 'ccc022b7e63a4d0a6d3a193c3940c88574060e58a184964c994998d86835a1b4',
            stakedTotal: '14182454495731682635157',
            rewardScore: {
              rawValidatorScore: '0.25',
              performanceScore: '0.9998677767864936',
              multisigScore: '',
              validatorScore: '',
              normalisedScore: '',
              validatorStatus:
                Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
            },
            rankingScore: {
              stakeScore: '0.2499583402766206',
              performanceScore: '0.9998677767864936',
              status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              previousStatus:
                Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              rankingScore: '',
              votingPower: '',
            },
          },
        },
        {
          node: {
            id: '966438c6bffac737cfb08173ffcb3f393c4692b099ad80cb45a82e2dc0a8cf99',
            stakedTotal: '9618711883996159534058',
            rewardScore: {
              rawValidatorScore: '0.3',
              performanceScore: '1',
              multisigScore: '',
              validatorScore: '0.31067',
              normalisedScore: '',
              validatorStatus:
                Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
            },
            rankingScore: {
              stakeScore: '0.25',
              performanceScore: '0.9998677767864936',
              status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              previousStatus:
                Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              rankingScore: '',
              votingPower: '',
            },
          },
        },
        {
          node: {
            id: '12c81b738e8051152e1afe44376ec37bca9216466e6d44cdd772194bad0ada81',
            stakedTotal: '4041343338923442976709',
            rewardScore: {
              rawValidatorScore: '0.35',
              performanceScore: '0.999629748500531',
              multisigScore: '',
              validatorScore: '',
              normalisedScore: '',
              validatorStatus:
                Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
            },
            rankingScore: {
              stakeScore: '0.2312',
              performanceScore: '0.9998677767864936',
              status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              previousStatus:
                Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              rankingScore: '',
              votingPower: '',
            },
          },
        },
      ],
    },
  },
};

const nodesDataMock: MockedResponse<NodesFragmentFragment[]> = {
  request: {
    query: NodesDocument,
  },
  result: {
    data: {
      ...MOCK_NODES,
    },
  },
};

const previousEpochMock: MockedResponse<PreviousEpochQuery> = {
  request: {
    query: PreviousEpochDocument,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      ...MOCK_PREVIOUS_EPOCH,
    },
  },
};

const MOCK_TOTAL_STAKE = '28832590188747439203824';

const renderValidatorsTable = (
  data = MOCK_NODES,
  previousEpochData = MOCK_PREVIOUS_EPOCH,
  validatorsView: ValidatorsView = 'all'
) => {
  return render(
    <AppStateProvider initialState={{ decimals: 18 }}>
      <MemoryRouter>
        <MockedProvider mocks={[nodesDataMock, previousEpochMock]}>
          <ConsensusValidatorsTable
            data={data}
            previousEpochData={previousEpochData}
            totalStake={MOCK_TOTAL_STAKE}
            validatorsView={validatorsView}
          />
        </MockedProvider>
      </MemoryRouter>
    </AppStateProvider>
  );
};

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(0);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Consensus validators table', () => {
  it('should initially render a list of nodes with the top third hidden', async () => {
    renderValidatorsTable();

    expect(await screen.findByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.queryByText('high')).toBeNull();
  });

  it('should show all validators if button is pressed', async () => {
    renderValidatorsTable();

    expect(await screen.findByText('medium')).toBeInTheDocument();
    expect(screen.queryByText('high')).toBeNull();

    act(() => {
      fireEvent.click(screen.getByTestId('show-all-validators'));
    });

    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();
  });

  it('should display the correctly formatted fields in the correct columns', async () => {
    const mockNode = [
      nodeFactory({
        id: '966438c6bffac737cfb08173ffcb3f393c4692b099ad80cb45a82e2dc0a8cf99',
        name: 'T-800 Terminator',
        avatarUrl:
          'https://upload.wikimedia.org/wikipedia/en/9/94/T-800_%28Model_101%29.png',
        pubkey:
          'ccc3b8362c25b09d20df8ea407b0a476d6b24a0e72bc063d0033c8841652ddd4',
        stakedTotal: '9618711883996159534058',
        rankingScore: {
          rankingScore: '0.4601942440481428',
          stakeScore: '0.2300971220240714',
          performanceScore: '1',
          votingPower: '2408',
          status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
          __typename: 'RankingScore',
        },
      }),
    ];

    renderValidatorsTable(mockNode, MOCK_PREVIOUS_EPOCH);

    expect(
      await screen.findByTestId('consensus-validators-table')
    ).toBeInTheDocument();

    const grid = screen.getByTestId('consensus-validators-table');

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
      grid.querySelector('[role="gridcell"][col-id="stake"]')
    ).toHaveTextContent('9,618.71');

    expect(
      grid.querySelector('[role="gridcell"][col-id="stakeShare"]')
    ).toHaveTextContent('23.01%');

    expect(
      grid.querySelector('[role="gridcell"][col-id="pendingStake"]')
    ).toHaveTextContent('0');

    expect(
      grid.querySelector('[role="gridcell"][col-id="totalPenalties"]')
    ).toHaveTextContent('10.07%');

    expect(
      grid.querySelector('[role="gridcell"][col-id="normalisedVotingPower"]')
    ).toHaveTextContent('24.08%');
  });
});
