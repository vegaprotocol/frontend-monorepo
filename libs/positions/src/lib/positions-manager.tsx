import { useRef, useCallback, useMemo } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { PositionSubscribe_positions } from './__generated__/PositionSubscribe';
import { Positions_party_positions } from './__generated__/Positions';

import type { AgGridReact } from 'ag-grid-react';
import PositionsTable, { getRowNodeId } from './positions-table';
import { positionsDataProvider } from './positions-data-provider';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
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
      {(data) => <PositionsTable ref={gridRef} data={data} />}
    </AsyncRenderer>
  );
};
