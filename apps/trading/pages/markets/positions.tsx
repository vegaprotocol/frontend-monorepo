import { useRef, useCallback } from 'react';
import { produce } from 'immer';
import assign from 'assign-deep';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '../../components/async-renderer';
import { PositionsTable, getRowNodeId } from '@vegaprotocol/positions';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import {
  positions_party_positions,
  positionSubscribe_positions,
  positionsDataProvider,
} from '@vegaprotocol/graphql';

import type { AgGridReact } from 'ag-grid-react';

export const Positions = () => {
  const { pathname, push } = useRouter();
  const gridRef = useRef<AgGridReact>();
  const update = useCallback(
    (delta: positionSubscribe_positions) => {
      const update: positions_party_positions[] = [];
      const add: positions_party_positions[] = [];
      if (!gridRef.current) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(getRowNodeId(delta));
      if (rowNode) {
        const updatedData = produce(
          rowNode.data,
          (draft: positions_party_positions) => assign(draft, delta)
        );
        if (updatedData !== rowNode.data) {
          update.push(delta);
        }
      } else {
        add.push(delta);
      }
      if (update.length || add.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
      }
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider<
    positions_party_positions,
    positionSubscribe_positions
  >(positionsDataProvider, update);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {(data) => (
        <PositionsTable
          ref={gridRef}
          data={data}
          onRowClicked={(id) =>
            push(`${pathname}/${id}?portfolio=orders&trade=orderbook`)
          }
        />
      )}
    </AsyncRenderer>
  );
};
