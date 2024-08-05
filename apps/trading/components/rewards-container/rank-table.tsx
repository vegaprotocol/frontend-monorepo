import compact from 'lodash/compact';
import type { RankTable } from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { Table } from '../table';

export const RankPayoutTable = ({
  rankTable,
}: {
  rankTable: (RankTable | null)[] | null;
}) => {
  const t = useT();
  const { payoutsPerWinnerAsPercentage, numPayouts, endRanks } =
    usePayoutPerRank(rankTable);
  let isOpenFinalTier = false;

  return (
    rankTable &&
    rankTable.length > 0 && (
      <>
        <Table
          columns={[
            {
              name: 'rankTier',
              displayName: t('Rank tier'),
            },
            {
              name: 'startRank',
              displayName: t('Start rank'),
            },
            {
              name: 'endRank',
              displayName: t('End rank'),
            },
            {
              name: 'placesPaid',
              displayName: t('Places paid'),
            },
            {
              name: 'payout',
              displayName: t('Payout'),
            },
          ]}
          data={compact(
            rankTable?.map((rank: RankTable | null, tier: number) => {
              const endRank = endRanks?.[tier];
              const placesPaid = numPayouts?.[tier];
              const isFinalTier = tier === rankTable.length - 1;
              isOpenFinalTier =
                isFinalTier && rank ? rank.shareRatio > 0 : false;

              if (isFinalTier && rank?.shareRatio === 0) {
                return null;
              }

              if (!rank) return null;

              return {
                rankTier: tier + 1,
                startRank: rank?.startRank,
                endRank: endRank || 'TBC*',
                placesPaid: placesPaid || 'TBC*',
                payout: payoutsPerWinnerAsPercentage?.[tier]
                  ? `${formatNumber(payoutsPerWinnerAsPercentage[tier], 2)} %`
                  : 'TBC*',
              };
            })
          )}
        />
        <p>
          {isOpenFinalTier &&
            t(
              '*Note: Final tier will payout to all game participants, therefore all payout estimates will lower depending on how many participants there are.'
            )}
        </p>
      </>
    )
  );
};

// Use rank table to calculate payouts per rank
// as per https://docs.google.com/spreadsheets/d/1RpWKnGEf4eYMxjI-feauRa9vWz3pNGdP05ejQrwWatg/
export const usePayoutPerRank = (
  rankTable?: (RankTable | null)[] | null
): {
  numPayouts?: number[];
  startRanks?: number[];
  endRanks?: number[];
  ratioShares?: number[];
  payoutsPerTier?: number[];
  payoutsPerWinner?: number[];
  payoutsPerWinnerAsPercentage?: number[];
} => {
  if (!rankTable) return {};

  const numPayouts: number[] = [],
    ratioShares: number[] = [],
    startRanks: number[] = [],
    endRanks: number[] = [],
    payoutsPerTier: number[] = [],
    payoutsPerWinner: number[] = [],
    payoutsPerWinnerAsPercentage: number[] = [];

  let totalRatio = 0;

  // We have to work out how many ppl in each bucket to get the total for the ratio
  rankTable.forEach((rank, tier) => {
    const startRank = rank?.startRank;
    startRank && startRanks.push(startRank);
    const endRank =
      tier < rankTable.length - 1 ? rankTable[tier + 1]?.startRank : undefined;
    endRank && endRanks.push(endRank);
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
    startRanks,
    endRanks,
    payoutsPerTier,
    payoutsPerWinner,
    payoutsPerWinnerAsPercentage,
  };
};
