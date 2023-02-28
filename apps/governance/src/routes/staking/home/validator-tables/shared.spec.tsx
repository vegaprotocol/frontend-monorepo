import {
  getLastEpochScoreAndPerformance,
  getTotalPenalties,
} from '../../shared';
import { stakedTotalPercentage } from './shared';

const MOCK_PREVIOUS_EPOCH = {
  epoch: {
    id: '1',
    validatorsConnection: {
      edges: [
        {
          node: {
            id: '0x123',
            rewardScore: {
              rawValidatorScore: '0.25',
            },
            rankingScore: {
              performanceScore: '0.75',
            },
          },
        },
      ],
    },
  },
};

describe('stakedTotalPercentage', () => {
  it('should return the correct percentage as a string, 2dp', () => {
    expect(stakedTotalPercentage('1.2345')).toBe('123.45%');
  });
});

describe('totalPenalties', () => {
  it('should return the correct penalty based on arbitrary values, test 1', () => {
    expect(
      getTotalPenalties(
        getLastEpochScoreAndPerformance(MOCK_PREVIOUS_EPOCH, '0x123')
          .rawValidatorScore,
        '0.1',
        '5000',
        '100000'
      )
    ).toBe('50.00%');
  });

  it('should return the correct penalty based on lower performance score than first test', () => {
    expect(
      getTotalPenalties(
        getLastEpochScoreAndPerformance(MOCK_PREVIOUS_EPOCH, '0x123')
          .rawValidatorScore,
        '0.05',
        '5000',
        '100000'
      )
    ).toBe('75.00%');
  });

  it('should return the correct penalty based on higher amount of stake than other tests (great penalty due to anti-whaling)', () => {
    expect(
      getTotalPenalties(
        getLastEpochScoreAndPerformance(MOCK_PREVIOUS_EPOCH, '0x123')
          .rawValidatorScore,
        '0.1',
        '5000',
        '5500'
      )
    ).toBe('97.25%');
  });
});
