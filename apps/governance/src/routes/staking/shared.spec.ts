import { BigNumber } from '../../lib/bignumber';
import {
  getLastEpochScoreAndPerformance,
  getNormalisedVotingPower,
  getUnnormalisedVotingPower,
  getFormattedPerformanceScore,
  getPerformancePenalty,
  getStakePercentage,
  calculateOverallPenalty,
  calculateOverstakedPenalty,
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

describe('calculateOverallPenalty', () => {
  it('returns null if rewardScore is null', () => {
    const res = calculateOverallPenalty('1', [
      {
        id: '1',
        rewardScore: null,
        stakedTotal: '',
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
    ]);

    expect(res).toBeNull();
  });

  it('returns null if rewardScore.rawValidatorScore is null (should not happen)', () => {
    const res = calculateOverallPenalty('1', [
      {
        id: '1',
        stakedTotal: '',
        rewardScore: {
          rawValidatorScore: '0.25',
          performanceScore: '0.75',
          multisigScore: '',
          validatorScore: null as unknown as string,
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
    ]);

    expect(res).toBeNull();
  });
});

describe('calculateOverstakedPenalty', () => {
  it('returns null if rewardScore is null', () => {
    const res = calculateOverstakedPenalty('1', [
      {
        id: '1',
        rewardScore: null,
        stakedTotal: '',
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
    ]);

    expect(res).toBeNull();
  });

  it('returns null if rewardScore.rawValidatorScore is null (should not happen)', () => {
    const res = calculateOverstakedPenalty('1', [
      {
        id: '1',
        stakedTotal: '',
        rewardScore: {
          rawValidatorScore: null as unknown as string,
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
    ]);

    expect(res).toBeNull();
  });
});
