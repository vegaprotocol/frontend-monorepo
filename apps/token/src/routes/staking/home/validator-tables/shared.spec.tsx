import { stakedTotalPercentage, totalPenalties } from './shared';

const mockPreviousEpochData = {
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
      totalPenalties(mockPreviousEpochData, '0x123', '0.1', '5000', '100000')
    ).toBe('50%');
  });

  it('should return the correct penalty based on lower performance score than first test', () => {
    expect(
      totalPenalties(mockPreviousEpochData, '0x123', '0.05', '5000', '100000')
    ).toBe('75%');
  });

  it('should return the correct penalty based on higher amount of stake than other tests (great penalty due to anti-whaling)', () => {
    expect(
      totalPenalties(mockPreviousEpochData, '0x123', '0.1', '5000', '5500')
    ).toBe('97.25%');
  });
});
