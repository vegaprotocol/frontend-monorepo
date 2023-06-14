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
  Reload,
  Load,
} from './generic-data-provider';
import type {
  ApolloClient,
  FetchResult,
  SubscriptionOptions,
  OperationVariables,
  ApolloQueryResult,
  QueryOptions,
} from '@apollo/client';
import { ApolloError } from '@apollo/client';
import type { GraphQLErrors } from '@apollo/client/errors';
import { GraphQLError } from 'graphql';
import type { Subscription, Observable } from 'zen-observable-ts';
import { waitFor } from '@testing-library/react';

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
};

type CombinedData = {
  totalCount?: number;
};

type SubscriptionData = QueryData;
type Delta = Data;
type Variables = { var: string; filter?: string[] };

const update = jest.fn<
  ReturnType<Update<Data, Delta, Variables>>,
  Parameters<Update<Data, Delta, Variables>>
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

const getData = jest.fn((r: QueryData | null) => r?.data || null);

const getDelta = jest.fn((r: SubscriptionData) => r.data);

const subscribe = makeDataProvider<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables
>({
  query,
  subscriptionQuery,
  update,
  getData,
  getDelta,
});

const combineData = jest.fn<
  ReturnType<CombineDerivedData<CombinedData, Variables>>,
  Parameters<CombineDerivedData<CombinedData, Variables>>
>();

const combineDelta = jest.fn<
  ReturnType<CombineDerivedDelta<CombinedData, CombinedData, Variables>>,
  Parameters<CombineDerivedDelta<CombinedData, CombinedData, Variables>>
>();

const combineInsertionData = jest.fn<
  ReturnType<CombineInsertionData<CombinedData, Variables>>,
  Parameters<CombineInsertionData<CombinedData, Variables>>
>();

const first = 100;
const paginatedSubscribe = makeDataProvider<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables
>({
  query,
  subscriptionQuery,
  update,
  getData,
  getDelta,
  pagination: {
    first,
    append: defaultAppend,
    getPageInfo: (r) => r?.pageInfo ?? null,
  },
});

const mockErrorPolicyGuard: (errors: GraphQLErrors) => boolean = jest
  .fn()
  .mockImplementation(() => true);
const errorGuardedSubscribe = makeDataProvider<
  QueryData,
  Data,
  SubscriptionData,
  Delta,
  Variables
>({
  query,
  subscriptionQuery,
  update,
  getData,
  getDelta,
  errorPolicyGuard: mockErrorPolicyGuard,
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

const variables = { var: 'val' };

describe('data provider', () => {
  beforeEach(() => {
    clearPendingQueries();
    callback.mockClear();
    getData.mockClear();
    clientQuery.mockClear();
    clientSubscribeUnsubscribe.mockClear();
    clientSubscribeSubscribe.mockClear();
  });
  it('memoize instance and unsubscribe if no subscribers', () => {
    const subscription1 = subscribe(jest.fn(), client, {
      ...variables,
      filter: ['1', '2'],
    });
    const subscription2 = subscribe(jest.fn(), client, {
      ...variables,
      filter: ['2', '1'],
    });
    expect(clientSubscribeSubscribe.mock.calls.length).toEqual(1);
    subscription1.unsubscribe();
    expect(clientSubscribeUnsubscribe.mock.calls.length).toEqual(0);
    subscription2.unsubscribe();
    expect(clientSubscribeUnsubscribe.mock.calls.length).toEqual(1);
  });

  it('calls callback before and after initial fetch', async () => {
    const data: Item[] = [];
    const subscription = subscribe(callback, client, variables);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toBe(null);
    expect(callback.mock.calls[0][0].loading).toBe(true);
    await resolveQuery({ data });
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0].data).toBe(data);
    expect(callback.mock.calls[1][0].loading).toBe(false);
    subscription.unsubscribe();
  });

  it('calls callback on error', async () => {
    const subscription = subscribe(callback, client, variables);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toBe(null);
    expect(callback.mock.calls[0][0].loading).toBe(true);
    const error = new Error('Rejected by unit test');
    await rejectQuery(error);
    expect(getData).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0].error).toEqual(error);
    expect(callback.mock.calls[1][0].loading).toBe(false);
    subscription.unsubscribe();
  });

  it('calls successful callback on NotFound error on party path', async () => {
    const subscription = subscribe(callback, client, variables);
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0].data).toBe(null);
    expect(callback.mock.calls[0][0].loading).toBe(true);
    const error = new Error() as ApolloError;
    const graphQLError = new GraphQLError(
      '',
      undefined,
      undefined,
      undefined,
      ['party'],
      undefined,
      {
        type: 'NotFound',
      }
    );
    error.graphQLErrors = [graphQLError];
    const data: Data = [];
    getData.mockReturnValueOnce(data);
    await rejectQuery(error);
    expect(getData).toHaveBeenCalledWith(null, variables);
    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0].data).toEqual(data);
    expect(callback.mock.calls[1][0].error).toEqual(undefined);
    expect(callback.mock.calls[1][0].loading).toBe(false);
    subscription.unsubscribe();
  });

  it('calls update and callback on each update', async () => {
    const data: Item[] = [];
    const subscription = subscribe(callback, client, variables);
    await resolveQuery({ data });
    const delta: Item[] = [];
    update.mockImplementationOnce((data, delta) => [...(data || []), ...delta]);
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

  it("don't calls callback on update if data doesn't change", async () => {
    const data: Item[] = [];
    const subscription = subscribe(callback, client, variables);
    await resolveQuery({ data });
    const delta: Item[] = [];
    update.mockImplementationOnce((data) => data || []);
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
    const data: Item[] = [];
    const subscription = subscribe(callback, client, variables);
    await resolveQuery({ data });
    subscription.reload();
    await resolveQuery({ data });
    expect(clientQuery.mock.calls.length).toBe(2);
    expect(clientSubscribeSubscribe.mock.calls.length).toBe(1);
    expect(clientSubscribeUnsubscribe.mock.calls.length).toBe(0);
    subscription.unsubscribe();
  });

  it('refetch data and restart subscription on reload with force', async () => {
    const data: Item[] = [];
    const subscription = subscribe(callback, client, variables);
    await resolveQuery({ data });
    subscription.reload(true);
    await resolveQuery({ data });
    expect(clientQuery.mock.calls.length).toBe(2);
    expect(clientSubscribeSubscribe.mock.calls.length).toBe(2);
    expect(clientSubscribeUnsubscribe.mock.calls.length).toBe(1);
    subscription.unsubscribe();
  });

  it('calls callback on flush', async () => {
    const data: Item[] = [];
    const subscription = subscribe(callback, client, variables);
    await resolveQuery({ data });
    const callbackCallsLength = callback.mock.calls.length;
    subscription.flush();
    expect(callback.mock.calls.length).toBe(callbackCallsLength + 1);
    subscription.unsubscribe();
  });

  it('loads requested data blocks', async () => {
    const subscription = paginatedSubscribe(callback, client, variables);
    await resolveQuery({
      data: generateData(),
      pageInfo: {
        hasNextPage: true,
        endCursor: '100',
      },
    });

    // load next page
    subscription.load && subscription.load();
    const lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.['pagination']).toEqual({
      after: '100',
      first,
    });
    await resolveQuery({
      data: generateData(100),
      pageInfo: {
        hasNextPage: false,
        endCursor: '200',
      },
    });

    // load next page when pageInfo.hasNextPage === false
    const clientQueryCallsLength = clientQuery.mock.calls.length;
    subscription.load && subscription.load();
    expect(clientQuery.mock.calls.length).toBe(clientQueryCallsLength);

    subscription.unsubscribe();
  });

  it('should retry with ignore error policy if errorPolicyGuard returns true', async () => {
    const subscription = errorGuardedSubscribe(callback, client, variables);
    const graphQLError = new GraphQLError(
      '',
      undefined,
      undefined,
      undefined,
      ['market', 'data'],
      undefined,
      {
        type: 'Internal',
      }
    );
    const graphQLErrors = [graphQLError];
    const error = new ApolloError({ graphQLErrors });

    await rejectQuery(error);
    const data = generateData(0, 5);
    await resolveQuery({
      data,
    });
    expect(mockErrorPolicyGuard).toHaveBeenNthCalledWith(1, graphQLErrors);
    await waitFor(() =>
      expect(getData).toHaveBeenCalledWith({ data }, variables)
    );
    subscription.unsubscribe();
  });
});

describe('derived data provider', () => {
  let subscription: {
    unsubscribe: () => void;
    reload: Reload;
    flush: () => void;
    load?: Load<CombinedData>;
  };
  afterEach(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
  it('memoize instance and unsubscribe if no subscribers', () => {
    clientSubscribeSubscribe.mockClear();
    clientSubscribeUnsubscribe.mockClear();
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
    subscription = derivedSubscribe(callback, client, variables);
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
    subscription = derivedSubscribe(callback, client, variables);
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
    subscription = derivedSubscribe(callback, client, variables);
    const data = { totalCount: 0 };
    combineData.mockReturnValueOnce(data);
    await resolveQuery({ data: part1 });
    await resolveQuery({ data: part2 });
    expect(combineData).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    update.mockImplementation((data, delta) => [...(data || []), ...delta]);
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
  });

  it('pass isInsert on any dependency isInsert, uses result of combineInsertionData as insertionData in next callback', async () => {
    clearPendingQueries();
    combineData.mockClear();
    combineDelta.mockClear();
    const callback = jest.fn<
      ReturnType<UpdateCallback<CombinedData, CombinedData>>,
      Parameters<UpdateCallback<CombinedData, CombinedData>>
    >();
    subscription = derivedSubscribe(callback, client, variables);
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
    update.mockImplementation((data, delta) => [...(data || []), ...delta]);
    combineData.mockReturnValueOnce({ ...data });
    const combinedInsertionData = {};
    combineInsertionData.mockReturnValueOnce(combinedInsertionData);
    subscription.load && subscription.load();
    const lastQueryArgs =
      clientQuery.mock.calls[clientQuery.mock.calls.length - 1][0];
    expect(lastQueryArgs?.variables?.['pagination']).toEqual({
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
  });
});
