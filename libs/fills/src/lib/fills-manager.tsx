import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import { FillsTable } from './fills-table';
import { fillsDataProvider } from './fills-data-provider';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { FillFields } from './__generated__/FillFields';
import type { FillsVariables } from './__generated__/Fills';

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
  const update = useCallback(() => false, []);
  const { data, loading, error } = useDataProvider(
    fillsDataProvider,
    update,
    variables
  );

  const fills = useMemo(() => {
    if (data?.length) {
      return [];
    }

    return data as FillFields[];
  }, [data]);

  return (
    <AsyncRenderer data={fills} loading={loading} error={error}>
      <FillsTable ref={gridRef} partyId={partyId} fills={fills} />
    </AsyncRenderer>
  );
};
