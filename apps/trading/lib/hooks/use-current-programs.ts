import { removePaginationWrapper } from '@vegaprotocol/utils';
import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import BigNumber from 'bignumber.js';
import { type ApolloError } from '@apollo/client';
import { isMarketActive } from 'apps/trading/lib/utils';
import min from 'lodash/min';
import {
  type CurrentProgramsQuery,
  type ReferralProgramFieldsFragment,
  useCurrentProgramsQuery,
  type VolumeDiscountFieldsFragment,
} from './__generated__/CurrentPrograms';

type Fees = {
  buybackFee: number;
  infrastructureFee: number;
  liquidityFee: number;
  makerFee: number;
  treasuryFee: number;
};

type RawFactors = Omit<
  | ReferralProgramFieldsFragment['benefitTiers'][0]['referralRewardFactors']
  | ReferralProgramFieldsFragment['benefitTiers'][0]['referralDiscountFactors']
  | VolumeDiscountFieldsFragment['benefitTiers'][0]['volumeDiscountFactors'],
  '__typename'
>;

export type Factors = {
  infrastructureFactor: number;
  makerFactor: number;
  liquidityFactor: number;
};

export type ReferralBenefitTier = {
  tier: number;
  discountFactors: Factors;
  /** calculated min discount factor for the tier */
  discountFactor: BigNumber;
  rewardFactors: Factors;
  /** calculated min reward factor for the tier */
  rewardFactor: BigNumber;
  minimumRunningNotionalTakerVolume: number;
  epochs: number;
};

export type ReferralStakingTier = {
  tier: number;
  minimumStakedTokens: string;
  referralRewardMultiplier: string;
};

export type VolumeDiscountBenefitTier = {
  tier: number;
  discountFactors: Factors;
  /** calculated min discount factor for the tier */
  discountFactor: BigNumber;
  minimumRunningNotionalTakerVolume: number;
};

export type ProgramsData = {
  referralProgram:
    | {
        details: Omit<
          ReferralProgramFieldsFragment,
          'benefitTiers' | 'stakingTiers'
        >;
        benefitTiers: ReferralBenefitTier[];
        stakingTiers: ReferralStakingTier[];
      }
    | undefined;
  volumeDiscountProgram:
    | {
        details: Omit<VolumeDiscountFieldsFragment, 'benefitTiers'>;
        benefitTiers: VolumeDiscountBenefitTier[];
      }
    | undefined;
  loading: boolean;
  error?: ApolloError;
};

export const useCurrentPrograms = (): ProgramsData => {
  const { data, loading, error } = useCurrentProgramsQuery({
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network',
  });

  const referralProgramData = data?.currentReferralProgram;
  const volumeDiscountProgramData = data?.currentVolumeDiscountProgram;

  const fees = getFees(data);

  let referralProgram = undefined;
  if (referralProgramData) {
    const benefitTiers = prepareReferralBenefitTiers(referralProgramData, fees);
    const stakingTiers = prepareReferralStakingTiers(referralProgramData);
    const details = omit(referralProgramData, 'benefitTiers', 'stakingTiers');

    referralProgram = {
      benefitTiers,
      stakingTiers,
      details,
    };
  }

  let volumeDiscountProgram = undefined;
  if (volumeDiscountProgramData) {
    const benefitTiers = prepareVolumeDiscountBenefitTiers(
      volumeDiscountProgramData,
      fees
    );
    const details = omit(volumeDiscountProgramData, 'benefitTiers');

    volumeDiscountProgram = {
      benefitTiers,
      details,
    };
  }

  return {
    referralProgram,
    volumeDiscountProgram,
    loading,
    error,
  };
};

function prepareReferralBenefitTiers(
  program: ReferralProgramFieldsFragment,
  fees: Fees
): ReferralBenefitTier[] {
  const benefitTiers = program.benefitTiers.map((t, i) => {
    const benefitTier: ReferralBenefitTier = {
      tier: i + 1, // sorted in asc order, hence first is the lowest tier
      rewardFactors: parseFactors(t.referralRewardFactors),
      rewardFactor: calcRewardFactor(
        fees,
        parseFactors(t.referralRewardFactors)
      ),
      discountFactors: parseFactors(t.referralDiscountFactors),
      discountFactor: calcDiscountFactor(
        fees,
        parseFactors(t.referralDiscountFactors)
      ),
      minimumRunningNotionalTakerVolume: Number(
        t.minimumRunningNotionalTakerVolume
      ),
      epochs: Number(t.minimumEpochs),
    };
    return benefitTier;
  });

  return benefitTiers;
}

function prepareReferralStakingTiers(
  program: ReferralProgramFieldsFragment
): ReferralStakingTier[] {
  const stakingTiers = sortBy(program.stakingTiers, (t) =>
    parseFloat(t.referralRewardMultiplier)
  ).map((t, i) => {
    return {
      tier: i + 1,
      ...t,
    };
  });

  return stakingTiers;
}

function prepareVolumeDiscountBenefitTiers(
  program: VolumeDiscountFieldsFragment,
  fees: Fees
): VolumeDiscountBenefitTier[] {
  const benefitTiers = program.benefitTiers.map((t, i) => {
    return {
      tier: i + 1,
      discountFactors: parseFactors(t.volumeDiscountFactors),
      discountFactor: calcDiscountFactor(
        fees,
        parseFactors(t.volumeDiscountFactors)
      ),
      minimumRunningNotionalTakerVolume: Number(
        t.minimumRunningNotionalTakerVolume
      ),
    };
  });

  return benefitTiers;
}

function getFees(data: CurrentProgramsQuery | undefined): Fees {
  const buybackFee = data?.defaultBuybackFee?.value
    ? Number(data.defaultBuybackFee.value)
    : 0;
  const infrastructureFee = data?.defaultInfrastructureFee?.value
    ? Number(data.defaultInfrastructureFee.value)
    : 0;
  const makerFee = data?.defaultMakerFee?.value
    ? Number(data.defaultMakerFee.value)
    : 0;
  const treasuryFee = data?.defaultTreasuryFee?.value
    ? Number(data.defaultTreasuryFee.value)
    : 0;
  const feesFromActiveMarkets = removePaginationWrapper(
    data?.feesPerMarket?.edges
  )
    .filter((m) => isMarketActive(m.state))
    .map((m) => m.fees.factors);
  const liquidityFees = feesFromActiveMarkets.map((f) =>
    Number(f.liquidityFee)
  );
  return {
    buybackFee,
    infrastructureFee,
    liquidityFee: min(liquidityFees) || 0,
    makerFee,
    treasuryFee,
  };
}

function calcRewardFactor(fees: Fees, factors: Factors) {
  const MF = BigNumber(fees.makerFee).times(factors.makerFactor);
  const IF = BigNumber(fees.infrastructureFee).times(
    factors.infrastructureFactor
  );
  const LF = BigNumber(fees.liquidityFee).times(factors.liquidityFactor);

  // makerFee * makerFactor + infraFee * infraFactor + MAX(liquidityFee) * liquidityFactor
  const reward = MF.plus(IF).plus(LF);

  const totalFee = BigNumber(fees.makerFee)
    .plus(fees.infrastructureFee)
    .plus(fees.liquidityFee)
    .plus(fees.buybackFee)
    .plus(fees.treasuryFee);

  // reward / total
  const rewardFactor = reward.dividedBy(totalFee);

  return rewardFactor;
}

function calcDiscountFactor(fees: Fees, factors: Factors) {
  const MF = BigNumber(fees.makerFee).times(
    BigNumber(1).minus(factors.makerFactor)
  );
  const IF = BigNumber(fees.infrastructureFee).times(
    BigNumber(1).minus(factors.infrastructureFactor)
  );
  const LF = BigNumber(fees.liquidityFee).times(
    BigNumber(1).minus(factors.liquidityFactor)
  );

  //  makerFee * (1 - makerDiscount) + infraFee * (1- infraDiscount) + MAX(liquidityFee) * (1- liquidityDiscount) + buybackFee + treasuryFee
  const discountedFee = MF.plus(IF)
    .plus(LF)
    .plus(fees.buybackFee)
    .plus(fees.treasuryFee);

  // makerFee + infraFee + MAX(liquidityFee) + buybackFee + treasuryFee
  const totalFee = BigNumber(fees.makerFee)
    .plus(fees.infrastructureFee)
    .plus(fees.liquidityFee)
    .plus(fees.buybackFee)
    .plus(fees.treasuryFee);

  // (total - discounted) / total
  const discountFactor = totalFee.minus(discountedFee).dividedBy(totalFee);

  return discountFactor;
}

export function areFactorsEqual(a: Factors, b: Factors) {
  const infra = a.infrastructureFactor === b.infrastructureFactor;
  const liqui = a.liquidityFactor === b.liquidityFactor;
  const maker = a.makerFactor === b.makerFactor;
  return infra && liqui && maker;
  // return isEqual(a, b)
}

export function parseFactors(data: RawFactors): Factors {
  return {
    infrastructureFactor: Number(data.infrastructureFactor),
    liquidityFactor: Number(data.liquidityFactor),
    makerFactor: Number(data.makerFactor),
  };
}
