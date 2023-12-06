import { getNumberFormat } from '@vegaprotocol/utils';
import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import { useReferralProgramQuery } from './__generated__/CurrentReferralProgram';
import BigNumber from 'bignumber.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK = {
  data: {
    currentReferralProgram: {
      id: 'abc',
      version: 1,
      benefitTiers: [
        {
          minimumEpochs: 1,
          minimumRunningNotionalTakerVolume: '100000',
          referralDiscountFactor: '0.1',
          referralRewardFactor: '0.05',
        },
        {
          minimumEpochs: 1,
          minimumRunningNotionalTakerVolume: '1000000',
          referralDiscountFactor: '0.1',
          referralRewardFactor: '0.075',
        },
        {
          minimumEpochs: 1,
          minimumRunningNotionalTakerVolume: '5000000',
          referralDiscountFactor: '0.1',
          referralRewardFactor: '0.1',
        },
        {
          minimumEpochs: 1,
          minimumRunningNotionalTakerVolume: '25000000',
          referralDiscountFactor: '0.1',
          referralRewardFactor: '0.125',
        },
        {
          minimumEpochs: 1,
          minimumRunningNotionalTakerVolume: '75000000',
          referralDiscountFactor: '0.1',
          referralRewardFactor: '0.15',
        },
        {
          minimumEpochs: 1,
          minimumRunningNotionalTakerVolume: '150000000',
          referralDiscountFactor: '0.07',
          referralRewardFactor: '0.175',
        },
      ],
      stakingTiers: [
        {
          minimumStakedTokens: '100000000000000000000',
          referralRewardMultiplier: '1.025',
        },
        {
          minimumStakedTokens: '1000000000000000000000',
          referralRewardMultiplier: '1.05',
        },
        {
          minimumStakedTokens: '5000000000000000000000',
          referralRewardMultiplier: '1.1',
        },
        {
          minimumStakedTokens: '50000000000000000000000',
          referralRewardMultiplier: '1.2',
        },
        {
          minimumStakedTokens: '250000000000000000000000',
          referralRewardMultiplier: '1.25',
        },
        {
          minimumStakedTokens: '500000000000000000000000',
          referralRewardMultiplier: '1.3',
        },
      ],
      endOfProgramTimestamp: '2024-12-31T01:00:00Z',
      windowLength: 30,
    },
    loading: false,
    error: undefined,
  },
};

export const useReferralProgram = () => {
  const { data, loading, error } = useReferralProgramQuery({
    fetchPolicy: 'cache-and-network',
  });

  if (!data || !data.currentReferralProgram) {
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
  ).map((t, i) => {
    return {
      tier: i + 1, // sorted in asc order, hence first is the lowest tier
      rewardFactor: Number(t.referralRewardFactor),
      commission: BigNumber(t.referralRewardFactor).times(100).toFixed(2) + '%',
      discountFactor: Number(t.referralDiscountFactor),
      discount: BigNumber(t.referralDiscountFactor).times(100).toFixed(2) + '%',
      minimumVolume: Number(t.minimumRunningNotionalTakerVolume),
      volume: getNumberFormat(0).format(
        Number(t.minimumRunningNotionalTakerVolume)
      ),
      epochs: Number(t.minimumEpochs),
    };
  });

  const stakingTiers = sortBy(data.currentReferralProgram.stakingTiers, (t) =>
    parseFloat(t.referralRewardMultiplier)
  ).map((t, i) => {
    return {
      tier: i + 1,
      ...t,
    };
  });

  const details = omit(
    data.currentReferralProgram,
    'benefitTiers',
    'stakingTiers'
  );

  return {
    benefitTiers,
    stakingTiers,
    details,
    loading,
    error,
  };
};
