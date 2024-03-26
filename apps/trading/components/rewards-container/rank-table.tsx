import type { RankTable } from '@vegaprotocol/types';
import { formatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';

export const RankPayoutTable = ({
  rankTable,
}: {
  rankTable: (RankTable | null)[] | null;
}) => {
  const t = useT();
  const { payoutsPerWinnerAsPercentage, numPayouts, endRanks } =
    usePayoutPerRank(rankTable);
  return (
    rankTable &&
    rankTable.length > 0 && (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="">
          <tr className="text-right text-xs divide-x p-4">
            <th scope="col">{t('Rank Tier')}</th>
            <th scope="col">{t('Start Rank')}</th>
            <th scope="col">{t('End Rank')}</th>
            <th scope="col">{t('Share Ratio')}</th>
            <th scope="col">{t('Places Paid')}</th>
            <th scope="col">{t('Payout')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-500 text-xs">
          {rankTable?.map((rank: RankTable | null, tier: number) => {
            const endRank = endRanks?.[tier];
            const placesPaid = numPayouts?.[tier];
            return (
              rank && (
                <tr
                  key={`rank-table-row-${tier}`}
                  className="whitespace-nowrap text-right divide-x p-4"
                >
                  <td>{tier + 1}</td>
                  <td>{rank.startRank}</td>
                  <td>{endRank || '-'}</td>
                  <td>{rank.shareRatio}</td>
                  <td>{placesPaid}</td>
                  <td>
                    {payoutsPerWinnerAsPercentage?.[tier]
                      ? `${formatNumber(payoutsPerWinnerAsPercentage[tier], 4)}
                    %`
                      : '-'}
                  </td>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
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
