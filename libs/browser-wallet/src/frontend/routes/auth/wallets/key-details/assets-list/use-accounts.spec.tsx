import { renderHook } from '@testing-library/react';
import { vegaAccountType } from '@vegaprotocol/rest-clients/dist/trading-data';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { mockStore } from '@/test-helpers/mock-store';

import { useAccountsStore } from './accounts-store';
import { useAccounts } from './use-accounts';
const MOCK_KEY = '1'.repeat(64);
const ASSET_ID = '2'.repeat(64);
const MARKET_ID = '3'.repeat(64);

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: jest.fn(),
  }),
}));

jest.mock('@/stores/wallets', () => ({
  useWalletStore: jest.fn().mockImplementation((function_) =>
    function_({
      getKeyById: jest.fn().mockReturnValue({
        publicKey: MOCK_KEY,
        name: 'test',
        index: 0,
      }),
    })
  ),
}));

jest.mock('./accounts-store', () => ({
  useAccountsStore: jest.fn(),
}));

describe('UseAccounts', () => {
  it('fetches the party, starts polling and returns the assets', () => {
    const fetchAccounts = jest.fn();
    const startPoll = jest.fn();
    const stopPoll = jest.fn();
    const reset = jest.fn();

    mockStore(useAccountsStore, {
      accountsByAsset: {
        [ASSET_ID]: [
          {
            balance: '1',
            asset: ASSET_ID,
            marketId: MARKET_ID,
            owner: MOCK_KEY,
            type: vegaAccountType.ACCOUNT_TYPE_GENERAL,
          },
        ],
      },
      fetchAccounts,
      startPoll,
      stopPoll,
      reset,
    });

    const view = renderHook(() => useAccounts(MOCK_KEY), {
      wrapper: MockNetworkProvider,
    });
    const { accountsByAsset } = view.result.current;
    expect(accountsByAsset).toStrictEqual({
      [ASSET_ID]: [
        {
          balance: '1',
          asset: ASSET_ID,
          marketId: MARKET_ID,
          owner: MOCK_KEY,
          type: vegaAccountType.ACCOUNT_TYPE_GENERAL,
        },
      ],
    });
    expect(fetchAccounts).toHaveBeenCalledTimes(1);
    expect(startPoll).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(0);
    expect(stopPoll).toHaveBeenCalledTimes(0);
    view.unmount();
    expect(fetchAccounts).toHaveBeenCalledTimes(1);
    expect(startPoll).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(stopPoll).toHaveBeenCalledTimes(1);
  });
});
