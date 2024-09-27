import {
  areFactorsEqual,
  type Factors,
  parseFactors,
  type ReferralBenefitTier,
  type ProgramsData,
} from '../../lib/hooks/use-current-programs';
import type { FeesQuery } from './__generated__/Fees';

export type ReferralStats = {
  /** The current discount factors applied */
  discountFactors: Factors | undefined;
  /** The current running volume (in program's window) */
  volume: number;
  /** The benefit tier matching the current factors applied */
  benefitTier: ReferralBenefitTier | undefined;
  /** The number of epochs in this set */
  epochsInSet: number;
  /** The referral code of this set (set id) */
  code: string | undefined;
  /** A flag indicating whether the given pubkey (see Fees query) is a referrer */
  isReferrer: boolean;
};

export type ReferralSetStat = NonNullable<
  FeesQuery['referralSetStats']['edges']['0']
>['node'];

export type ReferralSetReferees = NonNullable<
  FeesQuery['referralSetReferees']['edges']['0']
>['node'];

export type ReferralSetInfo =
  | NonNullable<FeesQuery['referrer']['edges']['0']>['node']
  | NonNullable<FeesQuery['referee']['edges']['0']>['node'];

export const EMPTY: ReferralStats = {
  discountFactors: undefined,
  volume: 0,
  benefitTier: undefined,
  epochsInSet: 0,
  code: undefined,
  isReferrer: false,
};

export const useReferralStats = (
  previousEpoch?: number,
  referralStats?: ReferralSetStat,
  setReferees?: ReferralSetReferees,
  program?: ProgramsData['referralProgram'],
  setIfReferrer?: ReferralSetInfo,
  setIfReferee?: ReferralSetInfo
): ReferralStats => {
  if (
    !previousEpoch ||
    referralStats?.atEpoch !== previousEpoch ||
    !program ||
    !setReferees
  ) {
    return EMPTY;
  }

  const discountFactors = parseFactors(referralStats.discountFactors);
  const volume = Number(
    referralStats?.referralSetRunningNotionalTakerVolume || 0
  );

  const benefitTiers = program?.benefitTiers || [];
  const benefitTier = benefitTiers.find((tier) =>
    areFactorsEqual(tier.discountFactors, discountFactors)
  );

  return {
    discountFactors,
    volume,
    benefitTier,
    epochsInSet: referralStats.atEpoch - setReferees.atEpoch,
    code: (setIfReferrer || setIfReferee)?.id,
    isReferrer: Boolean(setIfReferrer),
  };
};
