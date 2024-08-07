import { RpcMethods } from '@/lib/client-rpc-methods';

import { testingNetwork } from '../../../../../../config/well-known-networks';
import { useAccountsStore } from './accounts-store';

const ACCOUNT_FIXTURE = {
  owner: 'e81831b7412a9b97632093f651db892af859945ad7aa471835188ca24f54d143',
  balance: '40000000000000000000',
  asset: '84fff099818dc4f5319477f0812b4341565cfb32ccf735beede734e386b8108f',
  marketId: '',
  type: 'ACCOUNT_TYPE_GENERAL',
};

const ACCOUNT_RESPONSE_MOCK = {
  accounts: {
    edges: [
      {
        node: ACCOUNT_FIXTURE,
        cursor:
          'eyJpZCI6ImIzNDBjMTMwMDk2ODE5NDI4YTYyZTVkZjQwN2ZkNmFiZTY2ZTQ0NGI4OWFkNjRmNjcwYmViOTg2MjFjOWM2NjMifQ==',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor:
        'eyJpZCI6ImZkZjBlYzExOGQ5ODM5M2E3NzAyY2Y3MmU0NmZjODdhZDY4MGIxNTJmNjRiMmFhYzU5ZTA5M2FjMmQ2ODhmYmIifQ==',
      endCursor: 'eyJpZCI6IlhZWmFscGhhIn0=',
    },
  },
};

const request = async (method: string) => {
  if (method === RpcMethods.Fetch) {
    return ACCOUNT_RESPONSE_MOCK;
  }
  throw new Error('Tried to request unknown endpoint');
};

const initialState = useAccountsStore.getState();

describe('AccountsStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useAccountsStore.setState(initialState);
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should fetch accounts and group them by asset', async () => {
    const id = '1'.repeat(64);
    const { fetchAccounts } = useAccountsStore.getState();
    expect(useAccountsStore.getState().loading).toBeTruthy();
    expect(useAccountsStore.getState().error).toBeNull();
    await fetchAccounts(request, id, testingNetwork.id);
    expect(useAccountsStore.getState().loading).toBeFalsy();
    expect(useAccountsStore.getState().error).toBeNull();
    const { accounts, accountsByAsset } = useAccountsStore.getState();
    expect(accounts).toStrictEqual([ACCOUNT_FIXTURE]);
    expect(accountsByAsset).toStrictEqual({
      [ACCOUNT_FIXTURE.asset]: [ACCOUNT_FIXTURE],
    });
  });
  it('should set error if it fails to load', async () => {
    const id = '1'.repeat(64);
    const { fetchAccounts } = useAccountsStore.getState();
    expect(useAccountsStore.getState().loading).toBeTruthy();
    expect(useAccountsStore.getState().error).toBeNull();
    await fetchAccounts(
      () => {
        throw new Error('Error');
      },
      id,
      testingNetwork.id
    );
    expect(useAccountsStore.getState().loading).toBeFalsy();
    expect(useAccountsStore.getState().error).toStrictEqual(new Error('Error'));
    const { accounts, accountsByAsset } = useAccountsStore.getState();
    expect(accounts).toStrictEqual([]);
    expect(accountsByAsset).toStrictEqual({});
  });
  it('start poll should fetch accounts every 10 seconds', async () => {
    const id = '1'.repeat(64);
    const { startPoll, stopPoll } = useAccountsStore.getState();
    const mockRequest = jest.fn().mockImplementation(request);
    startPoll(mockRequest, id, testingNetwork.id);
    expect(mockRequest).not.toHaveBeenCalled();
    jest.advanceTimersByTime(10_000);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(30_000);
    expect(mockRequest).toHaveBeenCalledTimes(4);
    stopPoll();
    jest.advanceTimersByTime(30_000);
    expect(mockRequest).toHaveBeenCalledTimes(4);
    expect(useAccountsStore.getState().interval).toBeNull();
  });
  it('reset should reset all state', async () => {
    const { reset } = useAccountsStore.getState();
    const id = '1'.repeat(64);
    const mockRequest = jest.fn().mockImplementation(request);
    await useAccountsStore
      .getState()
      .fetchAccounts(mockRequest, id, testingNetwork.id);
    expect(useAccountsStore.getState().accounts).toStrictEqual([
      ACCOUNT_FIXTURE,
    ]);
    expect(useAccountsStore.getState().accountsByAsset).toStrictEqual({
      [ACCOUNT_FIXTURE.asset]: [ACCOUNT_FIXTURE],
    });
    reset();
    expect(useAccountsStore.getState().accounts).toStrictEqual([]);
    expect(useAccountsStore.getState().accountsByAsset).toStrictEqual({});
    expect(useAccountsStore.getState().error).toBeNull();
    expect(useAccountsStore.getState().loading).toBe(true);
  });
});
