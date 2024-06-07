import type { FC } from 'react';
import { AgGrid } from '@vegaprotocol/datagrid';
import { type ProposalListFieldsFragment } from '@vegaprotocol/proposals';
import { useColumnDefs } from './use-column-defs';
import { useT } from '../../../lib/use-t';
import { useProposedMarkets } from '../../../lib/hooks/use-markets';

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  filterParams: { buttons: ['reset'] },
};

interface ProposalListProps {
  cellRenderers: {
    [name: string]: FC<{ value: string; data: ProposalListFieldsFragment }>;
  };
}

export const ProposalsList = ({ cellRenderers }: ProposalListProps) => {
  const t = useT();
  const { data } = useProposedMarkets();
  const columnDefs = useColumnDefs();

  return (
    <AgGrid
      columnDefs={columnDefs}
      rowData={data}
      defaultColDef={defaultColDef}
      rowHeight={60}
      headerHeight={40}
      domLayout="autoHeight"
      getRowId={({ data }) => data.id}
      overlayNoRowsTemplate={t('No proposed markets')}
      components={cellRenderers}
      autoSizeStrategy={{
        type: 'fitGridWidth',
      }}
    />
  );
};
