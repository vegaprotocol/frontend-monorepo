import { usePayoutPerRank } from './rank-table';

// Test case as per https://docs.google.com/spreadsheets/d/1RpWKnGEf4eYMxjI-feauRa9vWz3pNGdP05ejQrwWatg/
describe('usePayoutPerRank', () => {
  it('should return payouts per person', () => {
    const rankTable = [
      {
        startRank: 1,
        shareRatio: 10,
      },
      {
        startRank: 2,
        shareRatio: 5,
      },
      {
        startRank: 5,
        shareRatio: 5,
      },
      {
        startRank: 10,
        shareRatio: 3,
      },
      {
        startRank: 20,
        shareRatio: 0,
      },
    ];

    const result = usePayoutPerRank(rankTable);

    expect(result).toEqual({
      numPayouts: [1, 3, 5, 10, 0],
      ratioShares: [10, 15, 25, 30, 0],
      payoutsPerTier: [0.125, 0.1875, 0.3125, 0.375, 0],
      payoutsPerWinner: [0.125, 0.0625, 0.0625, 0.0375],
      payoutsPerWinnerAsPercentage: [12.5, 6.25, 6.25, 3.75],
      endRanks: [2, 5, 10, 20],
      startRanks: [1, 2, 5, 10, 20],
    });
  });
});
