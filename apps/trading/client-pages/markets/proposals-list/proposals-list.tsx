import type { FC } from 'react';
import { AgGrid } from '@vegaprotocol/datagrid';
import { useProposedMarketsList } from '@vegaprotocol/markets';
import { type ProposalListFieldsFragment } from '@vegaprotocol/proposals';
import { useColumnDefs } from './use-column-defs';
import { useT } from '../../../lib/use-t';

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
  const { data } = useProposedMarketsList();
  const columnDefs = useColumnDefs();

  return (
    <AgGrid
      columnDefs={columnDefs}
      rowData={data}
      defaultColDef={defaultColDef}
      rowHeight={45}
      headerHeight={40}
      pagination={true}
      paginationPageSize={10}
      getRowId={({ data }) => data.id}
      overlayNoRowsTemplate={t('No proposed markets')}
      components={cellRenderers}
    />
  );
};
