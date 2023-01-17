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
              },
              rankingScore: {
                performanceScore: '0.75',
              },
            },
          },
          {
            node: {
              id: '0x234',
              rewardScore: {
                rawValidatorScore: '0.35',
              },
              rankingScore: {
                performanceScore: '0.85',
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
    });
    expect(
      getLastEpochScoreAndPerformance(mockPreviousEpochData, '0x234')
    ).toEqual({
      rawValidatorScore: '0.35',
      performanceScore: '0.85',
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
  it('should return the overstaked amount', () => {
    expect(
      // If a validator score is 0, any amount staked on the node is considered overstaked
      getOverstakedAmount('0', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(20));
    expect(
      getOverstakedAmount('0.05', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(15));
    expect(
      getOverstakedAmount('0.1', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(10));
    expect(
      getOverstakedAmount('0.15', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(5));
    expect(
      getOverstakedAmount('0.2', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(0));
  });

  it('should return 0 if the overstaked amount is negative', () => {
    expect(
      getOverstakedAmount('0.8', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(0));
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
