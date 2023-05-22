import { BigNumber } from '../../lib/bignumber';
import {
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getUnnormalisedVotingPower,
  getOverstakingPenalty,
  getFormattedPerformanceScore,
  getPerformancePenalty,
  getTotalPenalties,
  getStakePercentage,
} from './shared';
import * as Schema from '@vegaprotocol/types';

describe('getLastEpochScoreAndPerformance', () => {
  const mockPreviousEpochData = {
    epoch: {
      id: '123',
      validatorsConnection: {
        edges: [
          {
            node: {
              id: '0x123',
              stakedTotal: '',
              rewardScore: {
                rawValidatorScore: '0.25',
                performanceScore: '0.75',
                multisigScore: '',
                validatorScore: '',
                normalisedScore: '',
                validatorStatus:
                  Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              },
              rankingScore: {
                stakeScore: '0.25',
                performanceScore: '0.75',
                status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
                previousStatus:
                  Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
                rankingScore: '',
                votingPower: '',
              },
            },
          },
          {
            node: {
              id: '0x234',
              stakedTotal: '',
              rewardScore: {
                rawValidatorScore: '0.35',
                performanceScore: '0.85',
                multisigScore: '',
                validatorScore: '',
                normalisedScore: '',
                validatorStatus:
                  Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
              },
              rankingScore: {
                stakeScore: '0.25',
                performanceScore: '0.85',
                status: Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
                previousStatus:
                  Schema.ValidatorStatus.VALIDATOR_NODE_STATUS_TENDERMINT,
                rankingScore: '',
                votingPower: '',
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
  it('returns "0%" when both arguments are null or undefined', () => {
    expect(getOverstakingPenalty(null, null)).toBe('0%');
    expect(getOverstakingPenalty(undefined, undefined)).toBe('0%');
    expect(getOverstakingPenalty(null, undefined)).toBe('0%');
    expect(getOverstakingPenalty(undefined, null)).toBe('0%');
  });

  it('returns "0%" when one argument is null or undefined', () => {
    expect(getOverstakingPenalty('10', null)).toBe('0%');
    expect(getOverstakingPenalty(null, '20')).toBe('0%');
    expect(getOverstakingPenalty('10', undefined)).toBe('0%');
    expect(getOverstakingPenalty(undefined, '20')).toBe('0%');
  });

  it('returns "0%" when validatorScore or stakeScore is zero', () => {
    expect(getOverstakingPenalty('0', '20')).toBe('0%');
    expect(getOverstakingPenalty('10', '0')).toBe('0%');
  });

  it('returns the correct overstaking penalty', () => {
    expect(getOverstakingPenalty('0.18', '0.2')).toBe('10.00%');
    expect(getOverstakingPenalty('0.2', '0.2')).toBe('0.00%');
    expect(getOverstakingPenalty('0.04', '0.2')).toBe('80.00%');
  });

  it('handles string numbers with decimals', () => {
    expect(getOverstakingPenalty('7.5', '15')).toBe('50.00%');
    expect(getOverstakingPenalty('12.5', '25')).toBe('50.00%');
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
