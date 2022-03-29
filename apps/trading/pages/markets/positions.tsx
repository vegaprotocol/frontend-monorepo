import { useRef, useCallback, useMemo } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '../../components/async-renderer';
import { PositionsTable, getRowNodeId } from '@vegaprotocol/positions';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import {
  Positions_party_positions,
  PositionSubscribe_positions,
  positionsDataProvider,
} from '@vegaprotocol/graphql';
import { useVegaWallet } from '@vegaprotocol/wallet';

import type { AgGridReact } from 'ag-grid-react';

export const Positions = () => {
  const { pathname, push } = useRouter();
  const gridRef = useRef<AgGridReact>();
  const { keypair } = useVegaWallet();
  const variables = useMemo(() => ({ partyId: keypair.pub }), [keypair]);
  const update = useCallback(
    (delta: PositionSubscribe_positions) => {
      const update: Positions_party_positions[] = [];
      const add: Positions_party_positions[] = [];
      if (!gridRef.current) {
        return false;
      }
      const rowNode = gridRef.current.api.getRowNode(getRowNodeId(delta));
      if (rowNode) {
        const updatedData = produce<Positions_party_positions>(
          rowNode.data,
          (draft: Positions_party_positions) => {
            merge(draft, delta);
          }
        );
        if (updatedData !== rowNode.data) {
          update.push(updatedData);
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
    Positions_party_positions,
    PositionSubscribe_positions
  >(positionsDataProvider, update, variables);
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
