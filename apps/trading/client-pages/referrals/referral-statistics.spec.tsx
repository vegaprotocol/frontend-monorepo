import { MockedProvider, type MockedResponse } from '@apollo/react-testing';
import { render, screen, waitFor } from '@testing-library/react';
import { ReferralStatistics } from './referral-statistics';
import {
  ReferralSetsDocument,
  type ReferralSetsQueryVariables,
  type ReferralSetsQuery,
} from './hooks/__generated__/ReferralSets';
import {
  StakeAvailableDocument,
  type StakeAvailableQueryVariables,
  type StakeAvailableQuery,
} from '../../lib/hooks/__generated__/StakeAvailable';
import {
  RefereesDocument,
  type RefereesQueryVariables,
  type RefereesQuery,
} from './hooks/__generated__/Referees';
import { MemoryRouter } from 'react-router-dom';
import {
  mockConfig,
  MockedWalletProvider,
} from '@vegaprotocol/wallet-react/testing';
import { TooltipProvider } from '@vegaprotocol/ui-toolkit';
import {
  CurrentProgramsDocument,
  type CurrentProgramsQuery,
} from '../../lib/hooks/__generated__/CurrentPrograms';

const mockKeys = [
  {
    name: 'Key 1',
    publicKey: '1'.repeat(64),
  },
  {
    name: 'Key 2',
    publicKey: '2'.repeat(64),
  },
];
const MOCK_PUBKEY = mockKeys[0].publicKey;

const MOCK_STAKE_AVAILABLE: StakeAvailableQuery = {
  networkParameter: {
    __typename: 'NetworkParameter',
    value: '1',
  },
  party: {
    __typename: 'Party',
    stakingSummary: {
      __typename: 'StakingSummary',
      currentStakeAvailable: '1',
    },
  },
};

const MOCK_NON_ELIGIBILE_STAKE_AVAILABLE: StakeAvailableQuery = {
  networkParameter: {
    __typename: 'NetworkParameter',
    value: '1',
  },
  party: {
    __typename: 'Party',
    stakingSummary: {
      __typename: 'StakingSummary',
      currentStakeAvailable: '0',
    },
  },
};

const MOCK_REFERRAL_PROGRAM: CurrentProgramsQuery = {
  currentReferralProgram: {
    __typename: 'CurrentReferralProgram',
    benefitTiers: [
      {
        __typename: 'BenefitTier',
        minimumEpochs: 1,
        minimumRunningNotionalTakerVolume: '0',
        referralDiscountFactors: {
          __typename: 'DiscountFactors',
          infrastructureFactor: '0.01',
          liquidityFactor: '0.01',
          makerFactor: '0.01',
        },
        referralRewardFactors: {
          __typename: 'RewardFactors',
          infrastructureFactor: '0.01',
          liquidityFactor: '0.01',
          makerFactor: '0.01',
        },
      },
      {
        __typename: 'BenefitTier',
        minimumEpochs: 2,
        minimumRunningNotionalTakerVolume: '10',
        referralDiscountFactors: {
          __typename: 'DiscountFactors',
          infrastructureFactor: '0.02',
          liquidityFactor: '0.02',
          makerFactor: '0.02',
        },
        referralRewardFactors: {
          __typename: 'RewardFactors',
          infrastructureFactor: '0.02',
          liquidityFactor: '0.02',
          makerFactor: '0.02',
        },
      },
    ],
    endOfProgramTimestamp: '202411012023-11-26T05:58:24.045158Z',
    id: '123',
    stakingTiers: [
      {
        __typename: 'StakingTier',
        minimumStakedTokens: '100',
        referralRewardMultiplier: '1',
      },
      {
        __typename: 'StakingTier',
        minimumStakedTokens: '1000',
        referralRewardMultiplier: '2',
      },
    ],
    version: 2,
    windowLength: 3,
    endedAt: null,
  },
  currentVolumeDiscountProgram: undefined,
  defaultBuybackFee: undefined,
  defaultInfrastructureFee: undefined,
  defaultMakerFee: undefined,
  defaultTreasuryFee: undefined,
  feesPerMarket: undefined,
};

const MOCK_REFERRER_SET: ReferralSetsQuery = {
  referralSets: {
    __typename: 'ReferralSetConnection',
    edges: [
      {
        __typename: 'ReferralSetEdge',
        node: {
          __typename: 'ReferralSet',
          createdAt: '2023-11-26T05:58:24.045158Z',
          id: '3772e570fbab89e50e563036b01dd949c554e5b5fe7908449672dfce9a8adffa',
          referrer: MOCK_PUBKEY,
          updatedAt: '2023-11-26T05:58:24.045158Z',
        },
      },
    ],
  },
};

const MOCK_REFERREE_SET: ReferralSetsQuery = {
  referralSets: {
    __typename: 'ReferralSetConnection',
    edges: [
      {
        __typename: 'ReferralSetEdge',
        node: {
          __typename: 'ReferralSet',
          createdAt: '2023-11-26T05:58:24.045158Z',
          id: '3772e570fbab89e50e563036b01dd949c554e5b5fe7908449672dfce9a8adffa',
          referrer:
            '2222222222222222222222222222222222222222222222222222222222222222',
          updatedAt: '2023-11-26T05:58:24.045158Z',
        },
      },
    ],
  },
};

const MOCK_REFEREES: RefereesQuery = {
  referralSetReferees: {
    __typename: 'ReferralSetRefereeConnection',
    edges: [
      {
        node: {
          atEpoch: 1,
          joinedAt: '2023-11-21T14:17:09.257235Z',
          refereeId:
            '0987654321098765432109876543210987654321098765432109876543219876',
          referralSetId:
            '3772e570fbab89e50e563036b01dd949c554e5b5fe7908449672dfce9a8adffa',
          totalRefereeGeneratedRewards: '1234',
          totalRefereeNotionalTakerVolume: '5678',
          __typename: 'ReferralSetReferee',
        },
      },
    ],
  },
};

const MOCK_REFEREES_30: RefereesQuery = {
  referralSetReferees: {
    __typename: 'ReferralSetRefereeConnection',
    edges: [
      {
        node: {
          atEpoch: 1,
          joinedAt: '2023-11-21T14:17:09.257235Z',
          refereeId:
            '0987654321098765432109876543210987654321098765432109876543219876',
          referralSetId:
            '3772e570fbab89e50e563036b01dd949c554e5b5fe7908449672dfce9a8adffa',
          totalRefereeGeneratedRewards: '12340',
          totalRefereeNotionalTakerVolume: '56780',
          __typename: 'ReferralSetReferee',
        },
      },
    ],
  },
};

const programMock: MockedResponse<CurrentProgramsQuery> = {
  request: {
    query: CurrentProgramsDocument,
  },
  result: { data: MOCK_REFERRAL_PROGRAM },
};

const referralSetAsReferrerMock: MockedResponse<
  ReferralSetsQuery,
  ReferralSetsQueryVariables
> = {
  request: {
    query: ReferralSetsDocument,
    variables: {
      referrer: MOCK_PUBKEY,
    },
  },
  result: {
    data: MOCK_REFERRER_SET,
  },
};

const noReferralSetAsReferrerMock: MockedResponse<
  ReferralSetsQuery,
  ReferralSetsQueryVariables
> = {
  request: {
    query: ReferralSetsDocument,
    variables: {
      referrer: MOCK_PUBKEY,
    },
  },
  result: {
    data: { referralSets: { edges: [] } },
  },
};

const referralSetAsRefereeMock: MockedResponse<
  ReferralSetsQuery,
  ReferralSetsQueryVariables
> = {
  request: {
    query: ReferralSetsDocument,
    variables: {
      referee: MOCK_PUBKEY,
    },
  },
  result: {
    data: MOCK_REFERREE_SET,
  },
};

const noReferralSetAsRefereeMock: MockedResponse<
  ReferralSetsQuery,
  ReferralSetsQueryVariables
> = {
  request: {
    query: ReferralSetsDocument,
    variables: {
      referee: MOCK_PUBKEY,
    },
  },
  result: {
    data: { referralSets: { edges: [] } },
  },
};

const stakeAvailableMock: MockedResponse<
  StakeAvailableQuery,
  StakeAvailableQueryVariables
> = {
  request: {
    query: StakeAvailableDocument,
    variables: {
      partyId: MOCK_PUBKEY,
    },
  },
  result: {
    data: MOCK_STAKE_AVAILABLE,
  },
};

const nonEligibleStakeAvailableMock: MockedResponse<
  StakeAvailableQuery,
  StakeAvailableQueryVariables
> = {
  request: {
    query: StakeAvailableDocument,
    variables: {
      partyId: MOCK_PUBKEY,
    },
  },
  result: {
    data: MOCK_NON_ELIGIBILE_STAKE_AVAILABLE,
  },
};

const refereesMock: MockedResponse<RefereesQuery, RefereesQueryVariables> = {
  request: {
    query: RefereesDocument,
    variables: {
      code: MOCK_REFERRER_SET.referralSets.edges[0]?.node.id as string,
      aggregationEpochs:
        MOCK_REFERRAL_PROGRAM.currentReferralProgram?.windowLength,
    },
  },
  result: {
    data: MOCK_REFEREES,
  },
};

const refereesMock30: MockedResponse<RefereesQuery, RefereesQueryVariables> = {
  request: {
    query: RefereesDocument,
    variables: {
      code: MOCK_REFERRER_SET.referralSets.edges[0]?.node.id as string,
      aggregationEpochs: 30,
    },
  },
  result: {
    data: MOCK_REFEREES_30,
  },
};

describe('ReferralStatistics', () => {
  const renderComponent = (mocks: MockedResponse[]) => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} showWarnings={false}>
          <MockedWalletProvider>
            <TooltipProvider>
              <ReferralStatistics />
            </TooltipProvider>
          </MockedWalletProvider>
        </MockedProvider>
      </MemoryRouter>
    );
  };

  beforeAll(() => {
    mockConfig.store.setState({
      status: 'connected',
      keys: mockKeys,
      pubKey: mockKeys[0].publicKey,
    });
  });

  afterAll(() => {
    mockConfig.reset();
  });

  it('displays apply code when no data has been found for given pubkey', async () => {
    renderComponent([]);
    await waitFor(() => {
      expect(
        screen.queryByTestId('referral-apply-code-form')
      ).toBeInTheDocument();
    });
  });

  it('displays referrer stats when given pubkey is a referrer', async () => {
    renderComponent([
      programMock,
      referralSetAsReferrerMock,
      noReferralSetAsRefereeMock,
      stakeAvailableMock,
      refereesMock,
      refereesMock30,
    ]);

    await waitFor(() => {
      expect(
        screen.queryByTestId('referral-create-code-form')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('referral-statistics')).toBeInTheDocument();
      expect(screen.queryByTestId('referral-statistics')?.dataset.as).toEqual(
        'referrer'
      );
      // gets commission from 30 epochs query
      expect(screen.queryByTestId('total-commission-value')).toHaveTextContent(
        '12,340'
      );
    });
  });

  it('displays referee stats when given pubkey is a referee', async () => {
    renderComponent([
      programMock,
      noReferralSetAsReferrerMock,
      referralSetAsRefereeMock,
      stakeAvailableMock,
      refereesMock,
    ]);
    await waitFor(() => {
      expect(
        screen.queryByTestId('referral-create-code-form')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('referral-statistics')).toBeInTheDocument();
      expect(screen.queryByTestId('referral-statistics')?.dataset.as).toEqual(
        'referee'
      );
    });
  });

  it('displays eligibility warning when the set is no longer valid due to the referrers stake', async () => {
    renderComponent([
      programMock,
      noReferralSetAsReferrerMock,
      referralSetAsRefereeMock,
      nonEligibleStakeAvailableMock,
      refereesMock,
    ]);

    await waitFor(() => {
      expect(
        screen.queryByTestId('referral-create-code-form')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('referral-statistics')).toBeInTheDocument();
      expect(screen.queryByTestId('referral-statistics')?.dataset.as).toEqual(
        'referee'
      );
      expect(
        screen.queryByTestId('referral-eligibility-warning')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('referral-apply-code-form')
      ).toBeInTheDocument();
    });
  });
});
