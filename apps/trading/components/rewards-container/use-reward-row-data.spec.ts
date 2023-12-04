import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { getRewards } from './use-reward-row-data';
import * as Schema from '@vegaprotocol/types';

const asset1 = {
  id: 'asset1',
  name: 'USD (KRW)',
  symbol: 'USD-KRW',
  decimals: 6,
  quantum: '1000000',
  status: Schema.AssetStatus.STATUS_ENABLED,
  // @ts-ignore not needed
  source: {},
} as AssetFieldsFragment;

const asset2 = {
  id: 'asset2',
  name: 'tDAI TEST',
  symbol: 'tDAI',
  decimals: 5,
  quantum: '1',
  status: Schema.AssetStatus.STATUS_ENABLED,
  // @ts-ignore not needed
  source: {},
} as AssetFieldsFragment;

const asset3 = {
  id: 'asset3',
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  quantum: '1000000',
  status: Schema.AssetStatus.STATUS_ENABLED,
  // @ts-ignore not needed
  source: {},
} as AssetFieldsFragment;

const asset4 = {
  id: 'asset4',
  name: 'USDT-T',
  symbol: 'USDT-T',
  decimals: 18,
  quantum: '1',
  status: Schema.AssetStatus.STATUS_ENABLED,
  // @ts-ignore not needed
  source: {},
} as AssetFieldsFragment;

const assets: Record<string, AssetFieldsFragment> = {
  asset1,
  asset2,
  asset3,
  asset4,
};

const testData = {
  rewards: [
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
      assetId: 'asset1',
      amount: '31897424',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
      assetId: 'asset2',
      amount: '57',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
      assetId: 'asset3',
      amount: '5501',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
      assetId: 'asset3',
      amount: '5501',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
      assetId: 'asset4',
      amount: '5501',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
      assetId: 'asset4',
      amount: '456',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_REWARD_VALIDATOR_RANKING,
      assetId: 'asset4',
      amount: '4565',
    },
  ],
  assets,
};

describe('getRewards', () => {
  it('should return the correct rewards when infra fees are included', () => {
    const rewards = getRewards(testData.rewards, testData.assets);
    expect(rewards).toEqual([
      {
        asset: {
          id: 'asset1',
          name: 'USD (KRW)',
          symbol: 'USD-KRW',
          decimals: 6,
          quantum: '1000000',
          status: 'STATUS_ENABLED',
          source: {},
        },
        infrastructureFees: 31897424,
        staking: 0,
        priceTaking: 0,
        priceMaking: 0,
        liquidityProvision: 0,
        marketCreation: 0,
        averagePosition: 0,
        relativeReturns: 0,
        returnsVolatility: 0,
        validatorRanking: 0,
        total: 31897424,
      },
      {
        asset: {
          id: 'asset2',
          name: 'tDAI TEST',
          symbol: 'tDAI',
          decimals: 5,
          quantum: '1',
          status: 'STATUS_ENABLED',
          source: {},
        },
        infrastructureFees: 57,
        staking: 0,
        priceTaking: 0,
        priceMaking: 0,
        liquidityProvision: 0,
        marketCreation: 0,
        averagePosition: 0,
        relativeReturns: 0,
        returnsVolatility: 0,
        validatorRanking: 0,
        total: 57,
      },
      {
        asset: {
          id: 'asset3',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
          quantum: '1000000',
          status: 'STATUS_ENABLED',
          source: {},
        },
        infrastructureFees: 5501,
        staking: 0,
        priceTaking: 0,
        priceMaking: 0,
        liquidityProvision: 0,
        marketCreation: 0,
        averagePosition: 5501,
        relativeReturns: 0,
        returnsVolatility: 0,
        validatorRanking: 0,
        total: 11002,
      },
      {
        asset: {
          id: 'asset4',
          name: 'USDT-T',
          symbol: 'USDT-T',
          decimals: 18,
          quantum: '1',
          status: 'STATUS_ENABLED',
          source: {},
        },
        infrastructureFees: 0,
        staking: 0,
        priceTaking: 0,
        priceMaking: 5501,
        liquidityProvision: 456,
        marketCreation: 0,
        averagePosition: 0,
        relativeReturns: 0,
        returnsVolatility: 0,
        validatorRanking: 4565,
        total: 10522,
      },
    ]);
  });
});
