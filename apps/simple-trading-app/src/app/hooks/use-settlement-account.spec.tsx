import { renderHook } from '@testing-library/react';
import { useSettlementAccount } from './use-settlement-account';
import type { PartyBalanceQuery_party_accounts } from '../components/deal-ticket/__generated__/PartyBalanceQuery';

describe('useSettlementAccount Hook', () => {
  it('should filter accounts by settlementAssetId', () => {
    const accounts: PartyBalanceQuery_party_accounts[] = [
      {
        __typename: 'Account',
        balance: '2000000000000000000000',
        asset: {
          __typename: 'Asset',
          id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
          symbol: 'tBTC',
          name: 'tBTC TEST',
          decimals: 5,
        },
      },
      {
        __typename: 'Account',
        balance: '1000000000',
        asset: {
          __typename: 'Asset',
          id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
          symbol: 'tDAI',
          name: 'tDAI TEST',
          decimals: 5,
        },
      },
      {
        __typename: 'Account',
        balance: '5000000000000000000',
        asset: {
          __typename: 'Asset',
          id: 'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55',
          symbol: 'VEGA',
          name: 'Vega (testnet)',
          decimals: 18,
        },
      },
    ];
    const settlementAssetId =
      '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61';

    const { result } = renderHook(() =>
      useSettlementAccount(settlementAssetId, accounts)
    );
    expect(result.current?.balance).toBe(accounts[1].balance);
    expect(result.current?.asset).toEqual(accounts[1].asset);
  });

  it('should return null if no accounts', () => {
    const accounts: PartyBalanceQuery_party_accounts[] = [];
    const settlementAssetId =
      '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61';
    const { result } = renderHook(() =>
      useSettlementAccount(settlementAssetId, accounts)
    );
    expect(result.current).toBe(undefined);
  });
});
