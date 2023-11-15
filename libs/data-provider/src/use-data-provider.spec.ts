import { renderHook, act } from '@testing-library/react';
import {
  useDataProvider,
  useThrottledDataProvider,
  type useDataProviderParams,
} from './use-data-provider';
import { type Subscribe, type UpdateCallback } from './generic-data-provider';
import { MockedProvider } from '@apollo/client/testing';

type Data = number;
type Delta = number;
type Variables = { partyId: string; marketIds?: string[] };

const unsubscribe = jest.fn();
const reload = jest.fn();
const flush = jest.fn();
const load = jest.fn();
const update = jest.fn();
const insert = jest.fn();
const variables = { partyId: '0x123' };

const updateCallbackPayload: Parameters<UpdateCallback<Data, Delta>>['0'] = {
  data: 0,
  loading: false,
  loaded: true,
  pageInfo: null,
};

const dataProvider = jest.fn<
  ReturnType<Subscribe<Data, Delta, Variables>>,
  Parameters<Subscribe<Data, Delta, Variables>>
>();

dataProvider.mockReturnValue({
  unsubscribe,
  reload,
  flush,
  load,
});

jest.useFakeTimers();

describe('useDataProvider hook', () => {
  const render = (
    initialProps?: useDataProviderParams<Data, Delta, Variables>
  ) =>
    renderHook<
      ReturnType<typeof useDataProvider>,
      useDataProviderParams<Data, Delta, Variables>
    >((props) => useDataProvider(props), {
      wrapper: MockedProvider,
      initialProps,
    });
  beforeEach(() => {
    update.mockClear();
    insert.mockClear();
    dataProvider.mockClear();
    unsubscribe.mockClear();
  });
  it('calls update on load', async () => {
    const { result } = render({ dataProvider, update, variables });
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toEqual(undefined);
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback(updateCallbackPayload);
    });
    expect(result.current.data).toEqual(updateCallbackPayload.data);
    expect(result.current.loading).toEqual(false);
    expect(update).toBeCalledTimes(2);
    expect(update.mock.calls[1][0].data).toEqual(updateCallbackPayload.data);
  });

  it('calls update on error', async () => {
    const { result } = render({ dataProvider, update, variables });
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toEqual(undefined);
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback(updateCallbackPayload);
    });
    expect(result.current.data).toEqual(updateCallbackPayload.data);
    expect(result.current.loading).toEqual(false);
    expect(update).toBeCalledTimes(2);
    expect(update.mock.calls[1][0].data).toEqual(updateCallbackPayload.data);
  });

  it('calls update if isUpdate and skip setting state if update returns true', async () => {
    const { result } = render({ dataProvider, update, variables });
    let data = 0;
    const delta = 0;
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback({ ...updateCallbackPayload, data: ++data });
    });
    expect(update).toBeCalledTimes(2);
    expect(result.current.data).toEqual(data);
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: ++data,
        delta,
        isUpdate: true,
      });
    });
    expect(result.current.data).toEqual(data);
    expect(update).toBeCalledTimes(3);
    expect(update.mock.calls[2][0].data).toEqual(data);
    expect(update.mock.calls[2][0].delta).toEqual(delta);
    update.mockReturnValueOnce(true);
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: ++data,
        delta,
        isUpdate: true,
      });
    });
    expect(result.current.data).toEqual(update.mock.calls[2][0].data);
    expect(update).toBeCalledTimes(4);
    expect(update.mock.calls[3][0].data).toEqual(data);
    expect(update.mock.calls[3][0].delta).toEqual(delta);
  });

  it('calls insert if isInsert and skip setting state if update returns true', async () => {
    const { result } = render({ dataProvider, insert, variables });
    let data = 0;
    const insertionData = 0;
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback({ ...updateCallbackPayload, data: ++data });
    });
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: ++data,
        insertionData,
        isInsert: true,
      });
    });
    expect(result.current.data).toEqual(data);
    expect(insert).toBeCalledTimes(1);
    expect(insert.mock.calls[0][0].data).toEqual(data);
    expect(insert.mock.calls[0][0].insertionData).toEqual(insertionData);
    insert.mockReturnValueOnce(true);
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: ++data,
        insertionData,
        isInsert: true,
      });
    });
    expect(result.current.data).toEqual(insert.mock.calls[0][0].data);
    expect(insert).toBeCalledTimes(2);
    expect(insert.mock.calls[1][0].data).toEqual(data);
    expect(insert.mock.calls[1][0].insertionData).toEqual(insertionData);
  });

  it('calls dataProvider with updated variables if skip switched to true', async () => {
    const { rerender } = render({
      dataProvider,
      variables: { partyId: '' },
      skip: true,
    });
    expect(dataProvider).toBeCalledTimes(0);
    rerender({
      dataProvider,
      variables,
    });
    expect(dataProvider).toBeCalledTimes(1);
    expect(dataProvider.mock.calls[0][2]).toEqual(variables);
  });
  it('uses same data provider when rerendered with equal variables', async () => {
    const { rerender } = render({
      dataProvider,
      variables: { ...variables, marketIds: ['a', 'b'] },
    });
    expect(dataProvider).toBeCalledTimes(1);
    rerender({
      dataProvider,
      variables: { ...variables, marketIds: ['b', 'a'] },
    });
    expect(dataProvider).toBeCalledTimes(1);
    rerender({
      dataProvider,
      variables: { ...variables },
    });
    expect(dataProvider).toBeCalledTimes(2);
  });

  it('calls new update and insert when replaced', async () => {
    const { rerender } = render({
      dataProvider,
      update,
      insert,
      variables,
    });
    const data = 0;
    const delta = 0;
    const insertionData = 0;
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback({ ...updateCallbackPayload, data });
    });
    const newUpdate = jest.fn();
    const newInsert = jest.fn();
    expect(update).toBeCalledTimes(2);
    expect(insert).toBeCalledTimes(0);
    rerender({ dataProvider, update: newUpdate, insert: newInsert, variables });
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: data,
        delta,
        isUpdate: true,
      });
    });
    expect(newUpdate).toBeCalledTimes(1);
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data,
        insertionData,
        isInsert: true,
      });
    });
    expect(newUpdate).toBeCalledTimes(2);
    expect(newInsert).toBeCalledTimes(1);
    expect(update).toBeCalledTimes(2);
    expect(insert).toBeCalledTimes(0);
  });

  it('skip updates if skipUpdates is true', async () => {
    const { result, rerender } = render({
      dataProvider,
      update,
      variables,
      skipUpdates: true,
    });
    expect(update).toBeCalledTimes(1);
    let data = 0;
    const delta = 1;
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback({ ...updateCallbackPayload, data });
    });
    expect(update).toBeCalledTimes(2);
    expect(result.current.data).toEqual(data);
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: data + delta,
        delta,
        isUpdate: true,
      });
    });
    expect(update).toBeCalledTimes(2);
    expect(result.current.data).toEqual(data);
    rerender({ dataProvider, variables, update });
    expect(update).toBeCalledTimes(2);
    await act(async () => {
      callback({
        ...updateCallbackPayload,
        data: (data = data + delta),
        delta,
        isUpdate: true,
      });
    });
    expect(update).toBeCalledTimes(3);
    expect(result.current.data).toEqual(data);
    expect(dataProvider).toBeCalledTimes(1);
  });

  it('change data provider instance on variables change', async () => {
    const { result, rerender } = render({ dataProvider, update, variables });
    const callback = dataProvider.mock.calls[0][0];
    expect(dataProvider).toBeCalledTimes(1);
    await act(async () => {
      callback({ ...updateCallbackPayload });
    });
    expect(update).toBeCalledTimes(2);

    // setting same variables, with different object reference
    await act(async () => {
      rerender({ dataProvider, update, variables: { ...variables } });
    });
    expect(unsubscribe).toBeCalledTimes(0);
    expect(dataProvider).toBeCalledTimes(1);

    // changing variables after date was loaded
    await act(async () => {
      rerender({ dataProvider, update, variables: { partyId: '0x321' } });
    });
    expect(unsubscribe).toBeCalledTimes(1);
    expect(dataProvider).toBeCalledTimes(2);
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toEqual(undefined);
    await act(async () => {
      callback({ ...updateCallbackPayload });
    });
    expect(update).toBeCalledTimes(4);

    // changing variables, apollo query will return error
    await act(async () => {
      rerender({ dataProvider, update, variables });
    });
    expect(unsubscribe).toBeCalledTimes(2);
    expect(dataProvider).toBeCalledTimes(3);
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toEqual(undefined);
    await act(async () => {
      callback({
        data: null,
        loading: false,
        loaded: false,
        error: new Error(),
        pageInfo: null,
      });
    });
    expect(update).toBeCalledTimes(6);
  });

  it('do not create data provider instance when skip is true', async () => {
    const { result } = render({ dataProvider, update, variables, skip: true });
    expect(dataProvider).toBeCalledTimes(0);
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(false);
    expect(result.current.error).toEqual(undefined);
  });
});

describe('useThrottledDataProvider hook', () => {
  beforeEach(() => {
    dataProvider.mockClear();
  });
  it('throttling should delay update', async () => {
    const wait = 100;
    const { result } = renderHook(
      () =>
        useThrottledDataProvider(
          {
            dataProvider,
            variables,
          },
          wait
        ),
      { wrapper: MockedProvider }
    );
    expect(result.current.data).toEqual(null);
    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toEqual(undefined);
    const callback = dataProvider.mock.calls[0][0];
    await act(async () => {
      callback({ ...updateCallbackPayload, data: 1 }); // initial value
    });
    await act(async () => {
      callback({ ...updateCallbackPayload, data: 2, isUpdate: true, delta: 1 }); // first update, should be excluded
      callback({ ...updateCallbackPayload, data: 3, isUpdate: true, delta: 1 }); // next update, should be excluded
      callback({ ...updateCallbackPayload, data: 4, isUpdate: true, delta: 1 }); // next update, should be excluded
      callback({ ...updateCallbackPayload, data: 5, isUpdate: true, delta: 1 }); // last update, should be executed after timeout
    });
    expect(result.current.data).toEqual(1);
    await act(async () => {
      jest.runAllTimers();
    });
    expect(result.current.data).toEqual(5);
  });
});
