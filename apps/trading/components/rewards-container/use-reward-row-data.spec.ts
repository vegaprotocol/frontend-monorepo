import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { getRewards } from './use-reward-row-data';
import * as Schema from '@vegaprotocol/types';

const testData = {
  rewards: [
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
      assetId:
        'ff3df1224e159f8619d9d66c56c21a11e10422dfa99dc45937fdff364de5e546',
      amount: '31897424',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
      assetId:
        'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
      amount: '57',
    },
    {
      rewardType: Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
      assetId:
        '8ba0b10971f0c4747746cd01ff05a53ae75ca91eba1d4d050b527910c983e27e',
      amount: '5501',
    },
  ],
  assets: {
    ff3df1224e159f8619d9d66c56c21a11e10422dfa99dc45937fdff364de5e546: {
      id: 'ff3df1224e159f8619d9d66c56c21a11e10422dfa99dc45937fdff364de5e546',
      name: 'USD (KRW)',
      symbol: 'USD-KRW',
      decimals: 6,
      quantum: '1000000',
      source: {
        __typename: 'ERC20',
        contractAddress: '0xcFB5538B6235531BEbF09a04c25912e1327C5c52',
        lifetimeLimit: '100000000000000000000',
        withdrawThreshold: '1',
      },
      status: Schema.AssetStatus.STATUS_ENABLED,
    } as Schema.Asset,
    b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663: {
      id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
      name: 'tDAI TEST',
      symbol: 'tDAI',
      decimals: 5,
      quantum: '1',
      source: {
        __typename: 'ERC20',
        contractAddress: '0x26223f9C67871CFcEa329975f7BC0C9cB8FBDb9b',
        lifetimeLimit: '0',
        withdrawThreshold: '0',
      },
      status: Schema.AssetStatus.STATUS_ENABLED,
    } as AssetFieldsFragment,
    '8ba0b10971f0c4747746cd01ff05a53ae75ca91eba1d4d050b527910c983e27e': {
      id: '8ba0b10971f0c4747746cd01ff05a53ae75ca91eba1d4d050b527910c983e27e',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      quantum: '1000000',
      source: {
        __typename: 'ERC20',
        contractAddress: '0xdb10bF403771E44D0456F6C51EE655bb67AB05d9',
        lifetimeLimit: '100000000000',
        withdrawThreshold: '1',
      },
      status: Schema.AssetStatus.STATUS_ENABLED,
    } as AssetFieldsFragment,
    fdf0ec118d98393a7702cf72e46fc87ad680b152f64b2aac59e093ac2d688fbb: {
      id: 'fdf0ec118d98393a7702cf72e46fc87ad680b152f64b2aac59e093ac2d688fbb',
      name: 'USDT-T',
      symbol: 'USDT-T',
      decimals: 18,
      quantum: '1',
      source: {
        __typename: 'ERC20',
        contractAddress: '0x6381dD9f86646FD058e0abc95ec204A0a1054333',
        lifetimeLimit: '3000000000000000000000000000000000000000000',
        withdrawThreshold: '1',
      },
      status: Schema.AssetStatus.STATUS_ENABLED,
    } as AssetFieldsFragment,
  },
};

describe('getRewards', () => {
  it('should return the correct rewards when infra fees are included', () => {
    const rewards = getRewards(
      testData.rewards,
      testData.assets as Record<string, AssetFieldsFragment>
    );
    expect(rewards).toEqual([
      {
        asset: {
          decimals: 6,
          id: 'ff3df1224e159f8619d9d66c56c21a11e10422dfa99dc45937fdff364de5e546',
          name: 'USD (KRW)',
          quantum: '1000000',
          source: {
            __typename: 'ERC20',
            contractAddress: '0xcFB5538B6235531BEbF09a04c25912e1327C5c52',
            lifetimeLimit: '100000000000000000000',
            withdrawThreshold: '1',
          },
          status: 'STATUS_ENABLED',
          symbol: 'USD-KRW',
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
          decimals: 5,
          id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
          name: 'tDAI TEST',
          quantum: '1',
          source: {
            __typename: 'ERC20',
            contractAddress: '0x26223f9C67871CFcEa329975f7BC0C9cB8FBDb9b',
            lifetimeLimit: '0',
            withdrawThreshold: '0',
          },
          status: 'STATUS_ENABLED',
          symbol: 'tDAI',
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
          decimals: 6,
          id: '8ba0b10971f0c4747746cd01ff05a53ae75ca91eba1d4d050b527910c983e27e',
          name: 'Tether USD',
          quantum: '1000000',
          source: {
            __typename: 'ERC20',
            contractAddress: '0xdb10bF403771E44D0456F6C51EE655bb67AB05d9',
            lifetimeLimit: '100000000000',
            withdrawThreshold: '1',
          },
          status: 'STATUS_ENABLED',
          symbol: 'USDT',
        },
        infrastructureFees: 5501,
        staking: 0,
        priceTaking: 0,
        priceMaking: 0,
        liquidityProvision: 0,
        marketCreation: 0,
        averagePosition: 0,
        relativeReturns: 0,
        returnsVolatility: 0,
        validatorRanking: 0,
        total: 5501,
      },
    ]);
  });
});
