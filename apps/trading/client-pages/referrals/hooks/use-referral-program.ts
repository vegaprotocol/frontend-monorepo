import { getNumberFormat } from '@vegaprotocol/utils';
import { addDays } from 'date-fns';
import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import { useReferralProgramQuery } from './__generated__/CurrentReferralProgram';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      commission: Number(t.referralRewardFactor) * 100 + '%',
      discountFactor: Number(t.referralDiscountFactor),
      discount: Number(t.referralDiscountFactor) * 100 + '%',
      minimumVolume: Number(t.minimumRunningNotionalTakerVolume),
      volume: getNumberFormat(0).format(
        Number(t.minimumRunningNotionalTakerVolume)
      ),
      epochs: Number(t.minimumEpochs),
    };
  });

  const stakingTiers = sortBy(
    data.currentReferralProgram.stakingTiers,
    (t) => t.referralRewardMultiplier
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
