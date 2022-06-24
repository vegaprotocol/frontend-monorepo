import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import { Fills } from './fills';
import { fillsDataProvider } from './fills-data-provider';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { FillFields } from './__generated__/FillFields';

interface FillsManagerProps {
  partyId: string;
}

export const FillsManager = ({ partyId }: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
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
      <Fills ref={gridRef} partyId={partyId} fills={fills} />
    </AsyncRenderer>
  );
};
