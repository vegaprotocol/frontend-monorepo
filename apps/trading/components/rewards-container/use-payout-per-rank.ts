import type { Maybe, RankTable } from '@vegaprotocol/types';

// Use rank table to calculate payouts per rank
// as per https://docs.google.com/spreadsheets/d/1RpWKnGEf4eYMxjI-feauRa9vWz3pNGdP05ejQrwWatg/
export const usePayoutPerRank = (
  rankTable: Maybe<Maybe<RankTable>[]> | undefined
): {
  numPayouts?: number[];
  ratioShares?: number[];
  payoutsPerTier?: number[];
  payoutsPerWinner?: number[];
  payoutsPerWinnerAsPercentage?: number[];
} => {
  if (!rankTable) return {};

  const numPayouts: number[] = [],
    ratioShares: number[] = [],
    payoutsPerTier: number[] = [],
    payoutsPerWinner: number[] = [],
    payoutsPerWinnerAsPercentage: number[] = [];

  let totalRatio = 0;

  // We have to work out how many ppl in each bucket to get the total for the ratio
  rankTable.forEach((rank, tier) => {
    const startRank = rank?.startRank;
    const endRank =
      tier < rankTable.length - 1 ? rankTable[tier + 1]?.startRank : undefined;
    const numPayout = endRank && startRank ? endRank - startRank : 0;

    numPayouts.push(numPayout);

    const shareRatio = rank?.shareRatio;
    const ratioShare = shareRatio ? shareRatio * numPayout : 0;

    ratioShares.push(ratioShare);

    totalRatio += ratioShare;
  });

  rankTable.forEach((_rank, tier) => {
    const ratioShare = ratioShares[tier];

    // Then we multiply back out to get the total payout per tier
    const payoutPerTierValue = totalRatio ? ratioShare / totalRatio : 0;
    payoutsPerTier.push(payoutPerTierValue);

    const numPayout = numPayouts[tier];

    // And then divide by the payouts to get each individual winner payout
    const payoutPerWinnerValue =
      numPayout && payoutPerTierValue
        ? payoutPerTierValue / numPayout
        : undefined;
    payoutPerWinnerValue && payoutsPerWinner.push(payoutPerWinnerValue);

    payoutPerWinnerValue &&
      payoutsPerWinnerAsPercentage.push(payoutPerWinnerValue * 100);
  });

  return {
    numPayouts,
    ratioShares,
    payoutsPerTier,
    payoutsPerWinner,
    payoutsPerWinnerAsPercentage,
  };
};
