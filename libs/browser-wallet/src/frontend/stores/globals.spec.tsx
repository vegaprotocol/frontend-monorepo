import { RpcMethods } from '@/lib/client-rpc-methods';

import { useGlobalsStore } from './globals';

const globalsMock = {
  passphrase: true,
  locked: false,
  wallet: true,
  version: '0.0.1',
  settings: {
    telemetry: false,
  },
};

const request = (method: string) => {
  if (method === RpcMethods.AppGlobals) {
    return globalsMock;
  }
};

const initialState = useGlobalsStore.getState();

describe('Store', () => {
  beforeEach(() => {
    useGlobalsStore.setState(initialState);
  });
  it('loads globals from backend', async () => {
    expect(useGlobalsStore.getState().loading).toBe(true);
    expect(useGlobalsStore.getState().globals).toBeNull();
    await useGlobalsStore.getState().loadGlobals(request as unknown as unknown);
    expect(useGlobalsStore.getState().loading).toBe(false);
    expect(useGlobalsStore.getState().globals).toStrictEqual(globalsMock);
  });
  it('saves settings', async () => {
    const requestMock = jest.fn();
    const promise = useGlobalsStore
      .getState()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .saveSettings(requestMock as unknown as any, {
        setting: 'value',
      });
    expect(useGlobalsStore.getState().settingsLoading).toBe(true);
    await promise;
    expect(useGlobalsStore.getState().settingsLoading).toBe(false);
    expect(requestMock).toHaveBeenCalledWith(RpcMethods.UpdateSettings, {
      setting: 'value',
    });
  });
});
