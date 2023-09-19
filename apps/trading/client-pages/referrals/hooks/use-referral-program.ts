import { gql, useQuery } from '@apollo/client';
import { getNumberFormat } from '@vegaprotocol/utils';
import { addDays } from 'date-fns';
import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';

// TODO: Generate query
// eslint-disable-next-line
const REFERRAL_PROGRAM_QUERY = gql`
  query ReferralProgram {
    currentReferralProgram {
      id
      version
      endOfProgramTimestamp
      windowLength
      endedAt
      benefitTiers {
        minimumEpochs
        minimumRunningNotionalTakerVolume
        referralDiscountFactor
        referralRewardFactor
      }
      stakingTiers {
        minimumStakedTokens
        referralRewardMultiplier
      }
    }
  }
`;

const STAKING_TIERS_MAPPING: Record<number, string> = {
  1: 'Tradestarter',
  2: 'Mid level degen',
  3: 'Reward hoarder',
};

const MOCK = {
  data: {
    currentReferralProgram: {
      id: 'abc',
      version: 1,
      endOfProgramTimestamp: addDays(new Date(), 10).toISOString(),
      windowLength: 10,
      benefitTiers: [
        {
          minimumEpochs: 5,
          minimumRunningNotionalTakerVolume: '30000',
          referralDiscountFactor: '0.01',
          referralRewardFactor: '0.01',
        },
        {
          minimumEpochs: 5,
          minimumRunningNotionalTakerVolume: '20000',
          referralDiscountFactor: '0.05',
          referralRewardFactor: '0.05',
        },
        {
          minimumEpochs: 5,
          minimumRunningNotionalTakerVolume: '10000',
          referralDiscountFactor: '0.001',
          referralRewardFactor: '0.001',
        },
      ],
      stakingTiers: [
        {
          minimumStakedTokens: '10000',
          referralRewardMultiplier: '1',
        },
        {
          minimumStakedTokens: '20000',
          referralRewardMultiplier: '2',
        },
        {
          minimumStakedTokens: '30000',
          referralRewardMultiplier: '3',
        },
      ],
    },
  },
  loading: false,
  error: undefined,
};

export const useReferralProgram = () => {
  const { data, loading, error } = MOCK;
  // useQuery(REFERRAL_PROGRAM_QUERY, {
  //   fetchPolicy: 'cache-and-network',
  // });

  if (!data) {
    return {
      benefitTiers: [],
      stakingTiers: [],
      details: undefined,
      loading,
      error,
    };
  }

  const benefitTiers = sortBy(data.currentReferralProgram.benefitTiers, (t) =>
    Number(t.referralRewardFactor)
  )
    .reverse()
    .map((t, i) => {
      return {
        tier: i + 1,
        commission: Number(t.referralRewardFactor) * 100 + '%',
        discount: Number(t.referralDiscountFactor) * 100 + '%',
        volume: getNumberFormat(0).format(
          Number(t.minimumRunningNotionalTakerVolume)
        ),
      };
    });

  const stakingTiers = sortBy(
    data.currentReferralProgram.stakingTiers,
    (t) => t.referralRewardMultiplier
  ).map((t, i) => {
    return {
      tier: i + 1,
      label: STAKING_TIERS_MAPPING[i + 1],
      ...t,
    };
  });

  return {
    benefitTiers,
    stakingTiers,
    details: omit(data.currentReferralProgram, 'benefitTiers', 'stakingTiers'),
    loading,
    error,
  };
};
