import { BigNumber } from '../../lib/bignumber';
import {
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getUnnormalisedVotingPower,
  getOverstakingPenalty,
  getOverstakedAmount,
  getFormattedPerformanceScore,
  getPerformancePenalty,
  getTotalPenalties,
  getStakePercentage,
} from './shared';

describe('getLastEpochScoreAndPerformance', () => {
  const mockPreviousEpochData = {
    epoch: {
      id: '123',
      validatorsConnection: {
        edges: [
          {
            node: {
              id: '0x123',
              rewardScore: {
                rawValidatorScore: '0.25',
                performanceScore: '0.75',
              },
              rankingScore: {
                stakeScore: '0.25',
              },
            },
          },
          {
            node: {
              id: '0x234',
              rewardScore: {
                rawValidatorScore: '0.35',
                performanceScore: '0.85',
              },
              rankingScore: {
                stakeScore: '0.25',
              },
            },
          },
        ],
      },
    },
  };

  it("should return last epoch's performance and raw validator score for the given validator id", () => {
    expect(
      getLastEpochScoreAndPerformance(mockPreviousEpochData, '0x123')
    ).toEqual({
      rawValidatorScore: '0.25',
      performanceScore: '0.75',
      stakeScore: '0.25',
    });
    expect(
      getLastEpochScoreAndPerformance(mockPreviousEpochData, '0x234')
    ).toEqual({
      rawValidatorScore: '0.35',
      performanceScore: '0.85',
      stakeScore: '0.25',
    });
  });
});

describe('getNormalisedVotingPower', () => {
  it('should return the normalised voting power', () => {
    expect(getNormalisedVotingPower('123')).toEqual('1.23%');
    expect(getNormalisedVotingPower('789')).toEqual('7.89%');
  });
});

describe('getUnnormalisedVotingPower', () => {
  it('should return the unnormalised voting power', () => {
    expect(getUnnormalisedVotingPower('0.25')).toEqual('25.00%');
    expect(getUnnormalisedVotingPower('0.35')).toEqual('35.00%');
  });

  it('should return null if the validator score is null', () => {
    expect(getUnnormalisedVotingPower(null)).toEqual(null);
  });
});

describe('getOverstakingPenalty', () => {
  it('should return the overstaking penalty', () => {
    expect(
      getOverstakingPenalty(new BigNumber(100), Number(1000).toString())
    ).toEqual('10.00%');
    expect(
      getOverstakingPenalty(new BigNumber(500), Number(2000).toString())
    ).toEqual('25.00%');
  });
});

describe('getOverstakedAmount', () => {
  it('returns 0 when one argument is null or undefined', () => {
    expect(
      getOverstakedAmount('10', null).isEqualTo(new BigNumber(0))
    ).toBeTruthy();
    expect(
      getOverstakedAmount(null, '20').isEqualTo(new BigNumber(0))
    ).toBeTruthy();
    expect(
      getOverstakedAmount('10', undefined).isEqualTo(new BigNumber(0))
    ).toBeTruthy();
    expect(
      getOverstakedAmount(undefined, '20').isEqualTo(new BigNumber(0))
    ).toBeTruthy();
  });

  it('returns 0 when the result is negative', () => {
    expect(
      getOverstakedAmount('20', '10').isEqualTo(new BigNumber(0))
    ).toBeTruthy();
  });

  it('should return 0 if either validatorScore or stakeScore is undefined', () => {
    expect(getOverstakedAmount(undefined, '100')).toEqual(new BigNumber(0));
    expect(getOverstakedAmount('200', undefined)).toEqual(new BigNumber(0));
  });

  it('should return 0 if both validatorScore and stakeScore are 0', () => {
    expect(getOverstakedAmount('0', '0')).toEqual(new BigNumber(0));
  });

  it('returns 0 when both arguments are null or undefined', () => {
    expect(
      getOverstakedAmount(null, null).isEqualTo(new BigNumber(0))
    ).toBeTruthy();
    expect(
      getOverstakedAmount(undefined, undefined).isEqualTo(new BigNumber(0))
    ).toBeTruthy();
    expect(
      getOverstakedAmount(null, undefined).isEqualTo(new BigNumber(0))
    ).toBeTruthy();
    expect(
      getOverstakedAmount(undefined, null).isEqualTo(new BigNumber(0))
    ).toBeTruthy();
  });

  it('returns the correct overstaked amount', () => {
    expect(getOverstakedAmount('10', '20')).toEqual(new BigNumber(0.5));
    expect(getOverstakedAmount('30', '15')).toEqual(new BigNumber(0));
    expect(getOverstakedAmount('0', '10')).toEqual(new BigNumber(0));
  });

  it('should always return a non-negative BigNumber', () => {
    expect(getOverstakedAmount('100', '50').isNegative()).toBe(false);
    expect(getOverstakedAmount('50', '100').isNegative()).toBe(false);
    expect(getOverstakedAmount('0', '0').isNegative()).toBe(false);
  });

  it('handles string numbers with decimals', () => {
    expect(
      getOverstakedAmount('7.5', '15').isEqualTo(new BigNumber(0.5))
    ).toBeTruthy();
    expect(
      getOverstakedAmount('12.5', '25').isEqualTo(new BigNumber(0.5))
    ).toBeTruthy();
  });
});

describe('getFormattedPerformanceScore', () => {
  it('should return the formatted performance score', () => {
    expect(getFormattedPerformanceScore('0.25')).toEqual(new BigNumber(0.25));
    expect(getFormattedPerformanceScore('0.35')).toEqual(new BigNumber(0.35));
  });
});

describe('getPerformancePenalty', () => {
  it('should return the performance penalty', () => {
    expect(getPerformancePenalty('0.25')).toEqual('75.00%');
    expect(getPerformancePenalty('0.5')).toEqual('50.00%');
  });
});

describe('getTotalPenalties', () => {
  it('should return the total penalties', () => {
    expect(getTotalPenalties('0.25', '1', '5000', '10000')).toEqual('50.00%');
    expect(getTotalPenalties('0.25', '0.5', '5000', '10000')).toEqual('75.00%');
  });

  it('should return 0 if the total penalties is negative', () => {
    expect(getTotalPenalties('0.25', '0.5', '1000', '10000')).toEqual('0.00%');
  });
});

describe('getStakePercentage', () => {
  it('should return the stake percentage', () => {
    expect(
      getStakePercentage(new BigNumber('1000'), new BigNumber('100'))
    ).toEqual('10%');
    expect(
      getStakePercentage(new BigNumber('1000'), new BigNumber('500'))
    ).toEqual('50%');
    expect(
      getStakePercentage(new BigNumber('1000'), new BigNumber('257.5'))
    ).toEqual('25.75%');
  });

  it('should return "0%" if the total stake is 0', () => {
    expect(getStakePercentage(new BigNumber('0'), new BigNumber('0'))).toEqual(
      '0%'
    );
  });
});
