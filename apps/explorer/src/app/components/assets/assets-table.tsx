import { useMemo } from 'react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetTypeMapping, AssetStatusMapping } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { type AgGridReact } from 'ag-grid-react';
import { AgGrid } from '@vegaprotocol/datagrid';
import { type VegaICellRendererParams } from '@vegaprotocol/datagrid';
import { useRef, useLayoutEffect } from 'react';
import { BREAKPOINT_MD } from '../../config/breakpoints';
import { useNavigate } from 'react-router-dom';
import { type RowClickedEvent, ColDef } from 'ag-grid-community';

type AssetsTableProps = {
  data: AssetFieldsFragment[] | null;
};
export const AssetsTable = ({ data }: AssetsTableProps) => {
  const navigate = useNavigate();
  const ref = useRef<AgGridReact>(null);
  const showColumnsOnDesktop = () => {
    ref.current?.columnApi.setColumnsVisible(
      ['id', 'type', 'status'],
      window.innerWidth > BREAKPOINT_MD
    );
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', showColumnsOnDesktop);
    return () => {
      window.removeEventListener('resize', showColumnsOnDesktop);
    };
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: t('Symbol'), field: 'symbol' },
      { headerName: t('Name'), field: 'name' },
      {
        flex: 2,
        headerName: t('ID'),
        field: 'id',
        hide: window.innerWidth < BREAKPOINT_MD,
      },
      {
        colId: 'type',
        headerName: t('Type'),
        field: 'source.__typename',
        hide: window.innerWidth < BREAKPOINT_MD,
        valueFormatter: ({ value }: { value?: string }) =>
          value ? AssetTypeMapping[value].value : '',
      },
      {
        headerName: t('Status'),
        field: 'status',
        hide: window.innerWidth < BREAKPOINT_MD,
        valueFormatter: ({ value }: { value?: string }) =>
          value ? AssetStatusMapping[value].value : '',
      },
      {
        colId: 'actions',
        headerName: '',
        sortable: false,
        filter: false,
        resizable: false,
        wrapText: true,
        field: 'id',
        cellRenderer: ({
          value,
        }: VegaICellRendererParams<AssetFieldsFragment, 'id'>) =>
          value ? (
            <ButtonLink
              onClick={(e) => {
                navigate(value);
              }}
            >
              {t('View details')}
            </ButtonLink>
          ) : (
            ''
          ),
      },
    ],
    [navigate]
  );

  return (
    <AgGrid
      ref={ref}
      rowData={data}
      getRowId={({ data }: { data: AssetFieldsFragment }) => data.id}
      overlayNoRowsTemplate={t('This chain has no assets')}
      domLayout="autoHeight"
      defaultColDef={{
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
        filterParams: { buttons: ['reset'] },
        autoHeight: true,
      }}
      columnDefs={columnDefs}
      suppressCellFocus={true}
      onRowClicked={({ data }: RowClickedEvent) => {
        navigate(data.id);
      }}
    />
  );
};
