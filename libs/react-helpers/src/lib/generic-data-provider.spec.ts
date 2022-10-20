import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend,
} from './generic-data-provider';
import type {
  CombineDerivedData,
  CombineDerivedDelta,
  CombineInsertionData,
  Query,
  UpdateCallback,
  Update,
  PageInfo,
} from './generic-data-provider';
import type {
  ApolloClient,
  FetchResult,
  SubscriptionOptions,
  OperationVariables,
  ApolloQueryResult,
  QueryOptions,
} from '@apollo/client';
import type { Subscription, Observable } from 'zen-observable-ts';

type Item = {
  cursor: string;
  node: {
    id: string;
  };
};
type Data = Item[];
type QueryData = {
  data: Data;
  pageInfo?: PageInfo;
  totalCount?: number;
};

type CombinedData = {
  totalCount?: number;
};

type SubscriptionData = QueryData;
type Delta = Data;

const update = jest.fn<
  ReturnType<Update<Data, Delta>>,
  Parameters<Update<Data, Delta>>
>();

const callback = jest.fn<
  ReturnType<UpdateCallback<Data, Delta>>,
  Parameters<UpdateCallback<Data, Delta>>
>();

const query: Query<QueryData> = {
  kind: 'Document',
  definitions: [],
};
const subscriptionQuery: Query<SubscriptionData> = query;

const subscribe = makeDataProvider<QueryData, Data, SubscriptionData, Delta>({
  query,
  subscriptionQuery,
  update,
  getData: (r) => r.data,
  getDelta: (r) => r.data,
});

const combineData = jest.fn<
  ReturnType<CombineDerivedData<CombinedData>>,
  Parameters<CombineDerivedData<CombinedData>>
>();

const combineDelta = jest.fn<
  ReturnType<CombineDerivedDelta<CombinedData, CombinedData>>,
  Parameters<CombineDerivedDelta<CombinedData, CombinedData>>
>();

const combineInsertionData = jest.fn<
  ReturnType<CombineInsertionData<CombinedData>>,
  Parameters<CombineInsertionData<CombinedData>>
>();

const first = 100;
const paginatedSubscribe = makeDataProvider<
  QueryData,
  Data,
  SubscriptionData,
  Delta
>({
  query,
  subscriptionQuery,
  update,
  getData: (r) => r.data,
  getDelta: (r) => r.data,
  pagination: {
    first,
    append: defaultAppend,
    getPageInfo: (r) => r?.pageInfo ?? null,
    getTotalCount: (r) => r?.totalCount,
  },
});

const derivedSubscribe = makeDerivedDataProvider(
  [paginatedSubscribe, subscribe],
  combineData,
  combineDelta,
  combineInsertionData
);

const generateData = (start = 0, size = first) => {
  return new Array(size).fill(null).map((v, i) => ({
    cursor: (i + start + 1).toString(),
    node: {
      id: (i + start + 1).toString(),
    },
  }));
};

const clientSubscribeUnsubscribe = jest.fn();
const clientSubscribeSubscribe = jest.fn<
  Subscription,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [(value: FetchResult<SubscriptionData>) => void, (error: any) => void]
>(() => ({
  unsubscribe: clientSubscribeUnsubscribe,
  closed: false,
}));

const clientSubscribe = jest.fn<
  Observable<FetchResult<SubscriptionData>>,
  [SubscriptionOptions<OperationVariables, SubscriptionData>]
>(
  () =>
    ({
      subscribe: clientSubscribeSubscribe,
    } as unknown as Observable<FetchResult<SubscriptionData>>)
);

const clientQueryPromises: {
  resolve: (
    value:
      | ApolloQueryResult<QueryData>
      | PromiseLike<ApolloQueryResult<QueryData>>
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}[] = [];

const clientQuery = jest.fn<
  Promise<ApolloQueryResult<QueryData>>,
  [QueryOptions<OperationVariables, QueryData>]
>(() => {
  return new Promise((resolve, reject) => {
    clientQueryPromises.push({ resolve, reject });
  });
});

const client = {
  query: clientQuery,
  subscribe: clientSubscribe,
} as unknown as ApolloClient<object>;

const resolveQuery = async (data: QueryData) => {
  const clientQueryPromise = clientQueryPromises.shift();
  if (clientQueryPromise) {
    await clientQueryPromise.resolve({
      data,
      loading: false,
      networkStatus: 8,
    });
  }
};

const rejectQuery = async (reason: Error) => {
  const clientQueryPromise = clientQueryPromises.shift();
  if (clientQueryPromise) {
    await clientQueryPromise.reject(reason);
  }
};

const clearPendingQueries = () => {
  while (clientQueryPromises.length) {
    clientQueryPromises.pop();
  }
};

describe('data provider', () => {
  it('memoize instance and unsubscribe if no subscribers', () => {
    const subscription1 = subscribe(jest.fn(), client);
    const subscription2 = subscribe(jest.fn(), client);
    expect(clientSubscribeSubscribe.mock.calls.length).toEqual(1);
    subscription1.unsubscribe();
    expect(clientSubscribeUnsubscribe.mock.calls.length).toEqual(0);
    subscription2.unsubscribe();
    expect(clientSubscribeUnsubscribe.mock.calls.length).toEqual(1);
  });

  it('calls callback before and after initial fetch', async () => {
    callback.mockClear();
    const data: Item[] = [];
    const subscription = subscribe(callback, client);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toBe(null);
    expect(callback.mock.calls[0][0].loading).toBe(true);
    await resolveQuery({ data });
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0].data).toBe(data);
    expect(callback.mock.calls[1][0].loading).toBe(false);
    subscription.unsubscribe();
  });

  it('calls update and callback on each update', async () => {
    const data: Item[] = [];
    const subscription = subscribe(callback, client);
    await resolveQuery({ data });
    const delta: Item[] = [];
    update.mockImplementationOnce((data, delta) => [...data, ...delta]);
    // calling onNext from client.subscribe({ query }).subscribe(onNext)
    await clientSubscribeSubscribe.mock.calls[
      clientSubscribeSubscribe.mock.calls.length - 1
    ][0]({ data: { data: delta } });
    expect(update.mock.calls[update.mock.calls.length - 1][0]).toBe(data);
    expect(update.mock.calls[update.mock.calls.length - 1][1]).toBe(delta);
    expect(callback.mock.calls[callback.mock.calls.length - 1][0].delta).toBe(
      delta
    );
    subscription.unsubscribe();
  });

  it("don't calls callback on update if data doesn't", async () => {
    callback.mockClear();
    const data: Item[] = [];
    const subscription = subscribe(callback, client);
    await resolveQuery({ data });
    const delta: Item[] = [];
    update.mockImplementationOnce((data, delta) => data);
    const callbackCallsLength = callback.mock.calls.length;
    // calling onNext from client.subscribe({ query }).subscribe(onNext)
    await clientSubscribeSubscribe.mock.calls[
      clientSubscribeSubscribe.mock.calls.length - 1
    ][0]({ data: { data: delta } });
    expect(update.mock.calls[update.mock.calls.length - 1][0]).toBe(data);
    expect(update.mock.calls[update.mock.calls.length - 1][1]).toBe(delta);
    expect(callback.mock.calls.length).toBe(callbackCallsLength);
    subscription.unsubscribe();
  });

  it('refetch data on reload', async () => {
    clearPendingQueries();
    clientQuery.mockClear();
    clientSubscribeUnsubscribe.mockClear();
    clientSubscribeSubscribe.mockClear();
    const data: Item[] = [];
    const subscription = subscribe(callback, client);
    await resolveQuery({ data });
    subscription.reload();
    await resolveQuery({ data });
    expect(clientQuery.mock.calls.length).toBe(2);
    expect(clientSubscribeSubscribe.mock.calls.length).toBe(1);
    expect(clientSubscribeUnsubscribe.mock.calls.length).toBe(0);
    subscription.unsubscribe();
  });

  it('refetch data and restart subscription on reload with force', async () => {
    clientQuery.mockClear();
    clientSubscribeUnsubscribe.mockClear();
    clientSubscribeSubscribe.mockClear();
    const data: Item[] = [];
    const subscription = subscribe(callback, client);
    await resolveQuery({ data });
    subscription.reload(true);
    await resolveQuery({ data });
    expect(clientQuery.mock.calls.length).toBe(2);
    expect(clientSubscribeSubscribe.mock.calls.length).toBe(2);
    expect(clientSubscribeUnsubscribe.mock.calls.length).toBe(1);
    subscription.unsubscribe();
  });

  it('calls callback on flush', async () => {
    callback.mockClear();
    const data: Item[] = [];
    const subscription = subscribe(callback, client);
    await resolveQuery({ data });
    const callbackCallsLength = callback.mock.calls.length;
    subscription.flush();
    expect(callback.mock.calls.length).toBe(callbackCallsLength + 1);
    subscription.unsubscribe();
  });

  it('fills data with nulls if pagination is enabled', async () => {
    callback.mockClear();
    clearPendingQueries();
    const totalCount = 1000;
    const data: Item[] = new Array(first).fill(null).map((v, i) => ({
      cursor: i.toString(),
      node: {
        id: i.toString(),
      },
    }));
    const subscription = paginatedSubscribe(callback, client);
    await resolveQuery({
      data,
      totalCount,
      pageInfo: {
        hasNextPage: true,
      },
    });
    expect(callback.mock.calls[1][0].data?.length).toBe(totalCount);
    subscription.unsubscribe();
  });

  it('loads requested data blocks and inserts data with total count', async () => {
    callback.mockClear();
    const totalCount = 1000;
    const subscription = paginatedSubscribe(callback, client);
    await resolveQuery({
      data: generateData(),
      totalCount,
      pageInfo: {
        hasNextPage: true,
        endCursor: '100',
      },
    });

    // load next page
    subscription.load && subscription.load();
    let lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '100',
      first,
    });
    await resolveQuery({
      data: generateData(100),
      pageInfo: {
        hasNextPage: true,
        endCursor: '200',
      },
    });

    // load page with skip
    subscription.load && subscription.load(500, 600);
    lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '200',
      first,
      skip: 300,
    });
    await resolveQuery({
      data: generateData(500),
      pageInfo: {
        hasNextPage: true,
        endCursor: '600',
      },
    });

    // load in the gap
    subscription.load && subscription.load(400, 500);
    lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '200',
      first,
      skip: 200,
    });
    await resolveQuery({
      data: generateData(400),
      pageInfo: {
        hasNextPage: true,
        endCursor: '500',
      },
    });

    // load page after last block
    subscription.load && subscription.load(700, 800);
    lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '600',
      first,
      skip: 100,
    });
    await resolveQuery({
      data: generateData(700),
      pageInfo: {
        hasNextPage: true,
        endCursor: '800',
      },
    });

    // load last page shorter than expected
    subscription.load && subscription.load(950, 1050);
    lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '800',
      first,
      skip: 150,
    });
    await resolveQuery({
      data: generateData(950, 20),
      pageInfo: {
        hasNextPage: false,
        endCursor: '970',
      },
    });
    let lastCallbackArgs = callback.mock.calls[callback.mock.calls.length - 1];
    expect(lastCallbackArgs[0].totalCount).toBe(970);

    // load next page when pageInfo.hasNextPage === false
    const clientQueryCallsLength = clientQuery.mock.calls.length;
    subscription.load && subscription.load();
    expect(clientQuery.mock.calls.length).toBe(clientQueryCallsLength);

    // load last page longer than expected
    subscription.load && subscription.load(960, 1000);
    lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '960',
      first,
    });
    await resolveQuery({
      data: generateData(960, 40),
      pageInfo: {
        hasNextPage: true,
        endCursor: '1000',
      },
    });
    lastCallbackArgs = callback.mock.calls[callback.mock.calls.length - 1];
    expect(lastCallbackArgs[0].totalCount).toBe(1000);

    subscription.unsubscribe();
  });

  it('loads requested data blocks and inserts data without totalCount', async () => {
    callback.mockClear();
    const totalCount = undefined;
    const subscription = paginatedSubscribe(callback, client);
    await resolveQuery({
      data: generateData(),
      totalCount,
      pageInfo: {
        hasNextPage: true,
        endCursor: '100',
      },
    });
    let lastCallbackArgs = callback.mock.calls[callback.mock.calls.length - 1];
    expect(lastCallbackArgs[0].totalCount).toBe(undefined);

    // load next page
    subscription.load && subscription.load();
    await resolveQuery({
      data: generateData(100),
      pageInfo: {
        hasNextPage: true,
        endCursor: '200',
      },
    });
    lastCallbackArgs = callback.mock.calls[callback.mock.calls.length - 1];
    expect(lastCallbackArgs[0].totalCount).toBe(undefined);

    // load last page
    subscription.load && subscription.load();
    await resolveQuery({
      data: generateData(200, 50),
      pageInfo: {
        hasNextPage: false,
        endCursor: '250',
      },
    });
    lastCallbackArgs = callback.mock.calls[callback.mock.calls.length - 1];
    expect(lastCallbackArgs[0].totalCount).toBe(250);
    subscription.unsubscribe();
  });

  it('sets total count when first page has no next page', async () => {
    const subscription = paginatedSubscribe(callback, client);
    await resolveQuery({
      data: generateData(),
      pageInfo: {
        hasNextPage: false,
        endCursor: '100',
      },
    });
    const lastCallbackArgs =
      callback.mock.calls[callback.mock.calls.length - 1];
    expect(lastCallbackArgs[0].totalCount).toBe(100);
    subscription.unsubscribe();
  });
});

describe('derived data provider', () => {
  it('memoize instance and unsubscribe if no subscribers', () => {
    clientSubscribeSubscribe.mockClear();
    clientSubscribeUnsubscribe.mockClear();
    const variables = {};
    const subscription1 = derivedSubscribe(jest.fn(), client, variables);
    const subscription2 = derivedSubscribe(jest.fn(), client, variables);
    expect(clientSubscribeSubscribe.mock.calls.length).toEqual(2);
    subscription1.unsubscribe();
    expect(clientSubscribeUnsubscribe.mock.calls.length).toEqual(0);
    subscription2.unsubscribe();
    expect(clientSubscribeUnsubscribe.mock.calls.length).toEqual(2);
  });

  it('calls callback on each meaningful update, uses combineData function', async () => {
    clearPendingQueries();
    const totalCount = 1000;
    const part1 = {
      data: generateData(),
      totalCount,
      pageInfo: {
        hasNextPage: true,
        endCursor: '100',
      },
    };
    const part2: Item[] = [];
    const callback = jest.fn<
      ReturnType<UpdateCallback<CombinedData, CombinedData>>,
      Parameters<UpdateCallback<CombinedData, CombinedData>>
    >();
    const subscription = derivedSubscribe(callback, client);
    const data = { totalCount: 0 };
    combineData.mockReturnValueOnce(data);
    expect(callback.mock.calls.length).toBe(0);
    await resolveQuery(part1);
    expect(combineData.mock.calls.length).toBe(0);
    expect(callback.mock.calls.length).toBe(0);
    await resolveQuery({ data: part2 });
    expect(combineData.mock.calls.length).toBe(1);
    expect(combineData.mock.calls[0][0][0]).toBe(part1.data);
    expect(combineData.mock.calls[0][0][1]).toBe(part2);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toBe(data);
    expect(callback.mock.calls[0][0].loading).toBe(false);
    subscription.unsubscribe();
  });

  it('callback with error if any dependency has error, reloads all dependencies on reload', async () => {
    clearPendingQueries();
    combineData.mockClear();
    const part1: Item[] = [];
    const part2: Item[] = [];
    const callback = jest.fn<
      ReturnType<UpdateCallback<CombinedData, CombinedData>>,
      Parameters<UpdateCallback<CombinedData, CombinedData>>
    >();
    expect(callback.mock.calls.length).toBe(0);
    const subscription = derivedSubscribe(callback, client);
    const data = { totalCount: 0 };
    combineData.mockReturnValueOnce(data);
    expect(callback.mock.calls.length).toBe(0);
    await resolveQuery({ data: part1 });
    expect(combineData.mock.calls.length).toBe(0);
    expect(callback.mock.calls.length).toBe(0);
    const error = new Error('');
    await rejectQuery(error);
    expect(combineData.mock.calls.length).toBe(0);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].error).toBe(error);
    expect(callback.mock.calls[0][0].loading).toBe(false);
    subscription.reload();
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0].loading).toBe(true);
    await resolveQuery({ data: part1 });
    expect(callback.mock.calls.length).toBe(2);
    await resolveQuery({ data: part2 });
    expect(callback.mock.calls.length).toBe(3);
    expect(callback.mock.calls[2][0].data).toStrictEqual(data);
    expect(callback.mock.calls[2][0].loading).toBe(false);
    expect(callback.mock.calls[2][0].error).toBeUndefined();
    subscription.unsubscribe();
  });

  it('pass isUpdate on any dependency isUpdate, uses result of combineDelta as delta in next callback', async () => {
    clearPendingQueries();
    combineData.mockClear();
    const part1: Item[] = [];
    const part2: Item[] = [];
    const callback = jest.fn<
      ReturnType<UpdateCallback<CombinedData, CombinedData>>,
      Parameters<UpdateCallback<CombinedData, CombinedData>>
    >();
    const subscription = derivedSubscribe(callback, client);
    const data = { totalCount: 0 };
    combineData.mockReturnValueOnce(data);
    await resolveQuery({ data: part1 });
    await resolveQuery({ data: part2 });
    expect(combineData).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    update.mockImplementation((data, delta) => [...data, ...delta]);
    combineData.mockReturnValueOnce({ ...data });
    const combinedDelta = {};
    combineDelta.mockReturnValueOnce(combinedDelta);
    // calling onNext from client.subscribe({ query }).subscribe(onNext)
    const delta: Item[] = [];
    await clientSubscribeSubscribe.mock.calls[
      clientSubscribeSubscribe.mock.calls.length - 1
    ][0]({ data: { data: delta } });
    expect(combineDelta).toBeCalledTimes(1);
    expect(combineData).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    expect(callback.mock.calls[1][0].isUpdate).toBe(true);
    expect(callback.mock.calls[1][0].delta).toBe(combinedDelta);
    subscription.unsubscribe();
  });

  it('pass isInsert on any dependency isInsert, uses result of combineInsertionData as insertionData in next callback', async () => {
    clearPendingQueries();
    combineData.mockClear();
    combineDelta.mockClear();
    const callback = jest.fn<
      ReturnType<UpdateCallback<CombinedData, CombinedData>>,
      Parameters<UpdateCallback<CombinedData, CombinedData>>
    >();
    const subscription = derivedSubscribe(callback, client);
    const data = { totalCount: 0 };
    combineData.mockReturnValueOnce(data);
    await resolveQuery({
      data: generateData(),
      pageInfo: {
        hasNextPage: true,
        endCursor: '100',
      },
    });
    await resolveQuery({ data: [] });
    expect(combineData).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    update.mockImplementation((data, delta) => [...data, ...delta]);
    combineData.mockReturnValueOnce({ ...data });
    const combinedInsertionData = {};
    combineInsertionData.mockReturnValueOnce(combinedInsertionData);
    subscription.load && subscription.load();
    const lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.pagination).toEqual({
      after: '100',
      first,
    });
    await resolveQuery({
      data: generateData(100),
      pageInfo: {
        hasNextPage: true,
        endCursor: '200',
      },
    });
    expect(combineInsertionData).toBeCalledTimes(1);
    expect(combineData).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    expect(callback.mock.calls[1][0].isInsert).toBe(true);
    expect(callback.mock.calls[1][0].insertionData).toBe(combinedInsertionData);
    subscription.unsubscribe();
  });
});
