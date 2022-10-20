import { renderHook, act } from '@testing-library/react';
import { useThrottledDataProvider } from './use-data-provider';
import type { Subscribe, UpdateCallback } from '../lib/generic-data-provider';
import { MockedProvider } from '@apollo/client/testing';

type Data = number;
type Delta = number;

const unsubscribe = jest.fn();
const reload = jest.fn();
const flush = jest.fn();
const load = jest.fn();

const updateCallbackPayload: Parameters<UpdateCallback<Data, Delta>>['0'] = {
  data: 0,
  loading: false,
  loaded: false,
  pageInfo: null,
};

const dataProvider = jest.fn<
  ReturnType<Subscribe<Data, Delta>>,
  Parameters<Subscribe<Data, Delta>>
>();

dataProvider.mockReturnValue({
  unsubscribe,
  reload,
  flush,
  load,
});

jest.useFakeTimers();

describe('useThrottledDataProvider hook', () => {
  it('throttling should delay update', async () => {
    const wait = 100;
    const { result } = renderHook(
      () =>
        useThrottledDataProvider(
          {
            dataProvider,
          },
          wait
        ),
      { wrapper: MockedProvider }
    );
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toEqual(undefined);
    const callback =
      dataProvider.mock.calls[dataProvider.mock.calls.length - 1][0];
    await act(async () => {
      callback({ ...updateCallbackPayload, data: 1 }); // initial value
    });
    await act(async () => {
      callback({ ...updateCallbackPayload, data: 2, isUpdate: true, delta: 1 }); // first update, executed immediately
      callback({ ...updateCallbackPayload, data: 3, isUpdate: true, delta: 1 }); // next update, should be excluded
      callback({ ...updateCallbackPayload, data: 4, isUpdate: true, delta: 1 }); // next update, should be excluded
      callback({ ...updateCallbackPayload, data: 5, isUpdate: true, delta: 1 }); // last update, should be executed after timeout
    });
    expect(result.current.data).toEqual(2);
    await act(async () => {
      jest.runAllTimers();
    });
    expect(result.current.data).toEqual(5);
  });
});
