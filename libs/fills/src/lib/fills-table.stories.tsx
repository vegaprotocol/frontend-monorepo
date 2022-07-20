import type { Story, Meta } from '@storybook/react';
import type { Props } from './fills-table';
import type { AgGridReact } from 'ag-grid-react';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useCallback, useRef } from 'react';
import { FillsTable } from './fills-table';
import { generateFills, generateFill } from './test-helpers';
import type { Fills_party_tradesConnection_edges } from './__generated__/Fills';
import type { FillsSub_trades } from './__generated__/FillsSub';
import type {
  IGetRowsParams,
  BodyScrollEvent,
  BodyScrollEndEvent,
} from 'ag-grid-community';

export default {
  component: FillsTable,
  title: 'FillsTable',
} as Meta;

const Template: Story<Props> = (args) => <FillsTable {...args} />;
export const Default = Template.bind({});

const createdAt = new Date('2005-04-02 21:37:00').getTime();
const fills = generateFills();
Default.args = {
  partyId: 'party-id',
  rowData: fills.party?.tradesConnection.edges.map((e) => e.node) || [],
};

const getData = (
  start: number,
  end: number
): Fills_party_tradesConnection_edges[] =>
  new Array(end - start).fill(null).map((v, i) => ({
    __typename: 'TradeEdge',
    node: generateFill({
      id: (start + i).toString(),
      createdAt: new Date(createdAt - 1000 * (start + i)).toISOString(),
    }),
    cursor: (start + i).toString(),
  }));

const totalCount = 550;
const partyId = 'partyId';

const useDataProvider = ({
  insert,
}: {
  insert: ({
    insertionData,
    data,
    totalCount,
  }: {
    insertionData: Fills_party_tradesConnection_edges[];
    data: Fills_party_tradesConnection_edges[];
    totalCount?: number;
  }) => boolean;
}) => {
  const data = [...getData(0, 100), ...new Array(totalCount - 100).fill(null)];
  return {
    data,
    error: null,
    loading: false,
    load: (start?: number, end?: number) => {
      if (start === undefined) {
        start = data.findIndex((v) => !v);
      }
      if (end === undefined) {
        end = start + 100;
      }
      end = Math.min(end, totalCount);
      const insertionData = getData(start, end);
      data.splice(start, end - start, ...insertionData);
      insert({ data, totalCount, insertionData });
      return Promise.resolve();
    },
    totalCount,
  };
};

interface PaginationManagerProps {
  pagination: boolean;
}

const PaginationManager = ({ pagination }: PaginationManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<Fills_party_tradesConnection_edges[] | null>(null);
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const scrolledToTop = useRef(true);

  const addNewRows = useCallback(() => {
    if (newRows.current === 0) {
      return;
    }
    if (totalCountRef.current !== undefined) {
      totalCountRef.current += newRows.current;
    }
    newRows.current = 0;
    if (!gridRef.current?.api) {
      return;
    }
    gridRef.current.api.refreshInfiniteCache();
  }, []);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: Fills_party_tradesConnection_edges[];
      delta: FillsSub_trades[];
    }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (!scrolledToTop.current) {
        const createdAt = dataRef.current?.[0].node.createdAt;
        if (createdAt) {
          newRows.current += delta.filter(
            (trade) => trade.createdAt > createdAt
          ).length;
        }
      }
      dataRef.current = data;
      gridRef.current.api.refreshInfiniteCache();
      return true;
    },
    []
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: Fills_party_tradesConnection_edges[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const { data, error, loading, load, totalCount } = useDataProvider({
    insert,
  });

  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = async ({
    successCallback,
    failCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    startRow += newRows.current;
    endRow += newRows.current;
    try {
      if (
        dataRef.current &&
        dataRef.current.slice(startRow, endRow).some((i) => !i)
      ) {
        await load(startRow, endRow);
      }
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow).map((edge) => edge.node)
        : [];
      let lastRow = -1;
      if (totalCountRef.current !== undefined) {
        if (!totalCountRef.current) {
          lastRow = 0;
        } else {
          lastRow = totalCountRef.current;
        }
      } else if (rowsThisBlock.length < endRow - startRow) {
        lastRow = rowsThisBlock.length;
      }
      successCallback(rowsThisBlock, lastRow);
    } catch (e) {
      failCallback();
    }
  };

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  // id and onclick is needed only for mocked data
  let id = 0;
  const onClick = () => {
    if (!dataRef.current) {
      return;
    }
    const node = generateFill({
      id: (--id).toString(),
      createdAt: new Date(createdAt - 1000 * id).toISOString(),
    });
    update({
      data: [
        { cursor: '0', node, __typename: 'TradeEdge' },
        ...dataRef.current,
      ],
      delta: [node],
    });
  };

  return (
    <>
      <Button onClick={onClick}>Add row on top</Button>
      <AsyncRenderer loading={loading} error={error} data={data}>
        <FillsTable
          rowModelType="infinite"
          pagination={pagination}
          ref={gridRef}
          partyId={partyId}
          datasource={{ getRows }}
          onBodyScrollEnd={onBodyScrollEnd}
          onBodyScroll={onBodyScroll}
        />
      </AsyncRenderer>
    </>
  );
};

const PaginationTemplate: Story<PaginationManagerProps> = (args) => (
  <PaginationManager {...args} />
);

export const Pagination = PaginationTemplate.bind({});
Pagination.args = { pagination: true };

export const PaginationScroll = PaginationTemplate.bind({});
PaginationScroll.args = { pagination: false };

const InfiniteScrollManager = () => {
  const gridRef = useRef<AgGridReact | null>(null);
  const dataRef = useRef<(Fills_party_tradesConnection_edges | null)[] | null>(
    null
  );
  const totalCountRef = useRef<number | undefined>(undefined);
  const newRows = useRef(0);
  const scrolledToTop = useRef(true);

  const addNewRows = useCallback(() => {
    if (newRows.current === 0) {
      return;
    }
    if (totalCountRef.current !== undefined) {
      totalCountRef.current += newRows.current;
    }
    newRows.current = 0;
    if (!gridRef.current?.api) {
      return;
    }
    gridRef.current.api.refreshInfiniteCache();
  }, []);

  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: (Fills_party_tradesConnection_edges | null)[];
      delta: FillsSub_trades[];
    }) => {
      if (!gridRef.current?.api) {
        return false;
      }
      if (!scrolledToTop.current) {
        const createdAt = dataRef.current?.[0]?.node.createdAt;
        if (createdAt) {
          newRows.current += delta.filter(
            (trade) => trade.createdAt > createdAt
          ).length;
        }
      }
      dataRef.current = data;
      gridRef.current.api.refreshInfiniteCache();
      return true;
    },
    []
  );

  const insert = useCallback(
    ({
      data,
      totalCount,
    }: {
      data: Fills_party_tradesConnection_edges[];
      totalCount?: number;
    }) => {
      dataRef.current = data;
      totalCountRef.current = totalCount;
      return true;
    },
    []
  );

  const { data, error, loading, load, totalCount } = useDataProvider({
    insert,
  });
  totalCountRef.current = totalCount;
  dataRef.current = data;

  const getRows = async ({
    successCallback,
    failCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    startRow += newRows.current;
    endRow += newRows.current;
    try {
      if (dataRef.current && dataRef.current.indexOf(null) < endRow) {
        await load();
      }
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow).map((edge) => edge?.node)
        : [];
      let lastRow = -1;
      if (totalCountRef.current !== undefined) {
        if (!totalCountRef.current) {
          lastRow = 0;
        } else if (totalCountRef.current <= endRow) {
          lastRow = totalCountRef.current;
        }
      } else if (rowsThisBlock.length < endRow - startRow) {
        lastRow = rowsThisBlock.length;
      }
      successCallback(rowsThisBlock, lastRow);
    } catch (e) {
      failCallback();
    }
  };

  const onBodyScrollEnd = (event: BodyScrollEndEvent) => {
    if (event.top === 0) {
      addNewRows();
    }
  };

  const onBodyScroll = (event: BodyScrollEvent) => {
    scrolledToTop.current = event.top <= 0;
  };

  // id and onclick is needed only for mocked data
  let id = 0;
  const onClick = () => {
    if (!dataRef.current) {
      return;
    }
    const node = generateFill({
      id: (--id).toString(),
      createdAt: new Date(createdAt - 1000 * id).toISOString(),
    });
    update({
      data: [
        { cursor: '0', node, __typename: 'TradeEdge' },
        ...dataRef.current,
      ],
      delta: [node],
    });
  };

  return (
    <>
      <Button onClick={onClick}>Add row on top</Button>
      <AsyncRenderer loading={loading} error={error} data={data}>
        <FillsTable
          ref={gridRef}
          partyId={partyId}
          datasource={{ getRows }}
          rowModelType="infinite"
          onBodyScroll={onBodyScroll}
          onBodyScrollEnd={onBodyScrollEnd}
        />
      </AsyncRenderer>
    </>
  );
};

const InfiniteScrollTemplate: Story<Record<string, never>> = () => (
  <InfiniteScrollManager />
);

export const InfiniteScroll = InfiniteScrollTemplate.bind({});
