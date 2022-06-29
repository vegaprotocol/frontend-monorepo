import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import { FillsTable } from './fills-table';
import { fillsDataProvider } from './fills-data-provider';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { FillsVariables } from './__generated__/Fills';
import type { FillFields } from './__generated__/FillFields';
import type { FillsSub_trades } from './__generated__/FillsSub';
import isEqual from 'lodash/isEqual';

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo<FillsVariables>(
    () => ({
      partyId,
      pagination: {
        last: 300,
      },
    }),
    [partyId]
  );
  const update = useCallback((delta: FillsSub_trades[]) => {
    if (!gridRef.current) {
      return false;
    }
    const updateRows: FillFields[] = [];
    const add: FillFields[] = [];

    delta.forEach((d) => {
      if (!gridRef.current?.api) {
        return;
      }

      const rowNode = gridRef.current.api.getRowNode(d.id);

      if (rowNode) {
        if (!isEqual(d, rowNode.data)) {
          updateRows.push(d);
        }
      } else {
        add.push(d);
      }
    });

    if (updateRows.length || add.length) {
      gridRef.current.api.applyTransactionAsync({
        update: updateRows,
        add,
        addIndex: 0,
      });
    }

    return true;
  }, []);

  const { data, loading, error } = useDataProvider(
    fillsDataProvider,
    update,
    variables
  );

  const fills = useMemo(() => {
    if (!data?.length) {
      return [];
    }

    return data;
  }, [data]);

  return (
    <AsyncRenderer data={fills} loading={loading} error={error}>
      <FillsTable ref={gridRef} partyId={partyId} fills={fills} />
    </AsyncRenderer>
  );
};
