import { gql, useQuery } from '@apollo/client';
import { getNumberFormat } from '@vegaprotocol/utils';
import { addDays } from 'date-fns';

// TODO: Generate query
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

export const useReferralProgram = () => {
  // TODO: get real data
  // const { data, loading, error } = useQuery(REFERRAL_PROGRAM_QUERY);

  const dummyData = {
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
    },
  } as const;

  const benefitTiers = dummyData.currentReferralProgram.benefitTiers.map(
    (t, i) => {
      return {
        tier: i + 1,
        commission: Number(t.referralRewardFactor) * 100 + '%',
        discount: Number(t.referralDiscountFactor) * 100 + '%',
        volume: getNumberFormat(0).format(
          Number(t.minimumRunningNotionalTakerVolume)
        ),
      };
    }
  );

  // TODO: return real loading, error values
  return {
    benefitTiers,
    loading: false,
    error: undefined,
  };
};
