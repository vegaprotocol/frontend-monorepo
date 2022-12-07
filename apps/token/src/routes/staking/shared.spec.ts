import { BigNumber } from '../../lib/bignumber';
import {
  getRawValidatorScore,
  getNormalisedVotingPower,
  getUnnormalisedVotingPower,
  getOverstakingPenalty,
  getOverstakedAmount,
  getFormattedPerformanceScore,
  getPerformancePenalty,
  getTotalPenalties,
} from './shared';

describe('getRawValidatorScore', () => {
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
            },
          },
          {
            node: {
              id: '0x234',
              rewardScore: {
                rawValidatorScore: '0.35',
              },
            },
          },
        ],
      },
    },
  };

  it('should return the rawValidatorScore for the given validator id', () => {
    expect(getRawValidatorScore(mockPreviousEpochData, '0x123')).toEqual(
      '0.25'
    );
    expect(getRawValidatorScore(mockPreviousEpochData, '0x234')).toEqual(
      '0.35'
    );
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
    expect(getUnnormalisedVotingPower('0.25')).toEqual('25%');
    expect(getUnnormalisedVotingPower('0.35')).toEqual('35%');
  });

  it('should return null if the validator score is null', () => {
    expect(getUnnormalisedVotingPower(null)).toEqual(null);
  });
});

describe('getOverstakingPenalty', () => {
  it('should return the overstaking penalty', () => {
    expect(
      getOverstakingPenalty(new BigNumber(100), Number(1000).toString())
    ).toEqual('10%');
    expect(
      getOverstakingPenalty(new BigNumber(500), Number(2000).toString())
    ).toEqual('25%');
  });
});

describe('getOverstakedAmount', () => {
  it('should return the overstaked amount', () => {
    expect(
      getOverstakedAmount('0.21', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(1));
    expect(
      getOverstakedAmount('0.22', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(2));
    expect(
      getOverstakedAmount('0.30', Number(100).toString(), Number(20).toString())
    ).toEqual(new BigNumber(10));
  });

  it('should return 0 if the overstaked amount is negative', () => {
    expect(
      getOverstakedAmount('0.19', Number(100).toString(), Number(20).toString())
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
    expect(getPerformancePenalty('0.25')).toEqual('75%');
    expect(getPerformancePenalty('0.5')).toEqual('50%');
  });
});

describe('getTotalPenalties', () => {
  it('should return the total penalties', () => {
    expect(getTotalPenalties('0.25', '1', '5000', '10000')).toEqual('50%');
    expect(getTotalPenalties('0.25', '0.5', '5000', '10000')).toEqual('75%');
  });

  it('should return 0 if the total penalties is negative', () => {
    expect(getTotalPenalties('0.25', '0.5', '1000', '10000')).toEqual('0%');
  });
});
