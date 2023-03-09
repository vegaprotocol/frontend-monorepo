import type { MarketFieldsFragment } from '@vegaprotocol/market-list';
import { t } from '@vegaprotocol/i18n';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/datagrid';
import type {
  VegaICellRendererParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { useRef, useLayoutEffect } from 'react';
import { BREAKPOINT_MD } from '../../config/breakpoints';
import { MarketStateMapping } from '@vegaprotocol/types';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { RowClickedEvent } from 'ag-grid-community';
import { Link, useNavigate } from 'react-router-dom';

type MarketsTableProps = {
  data: MarketFieldsFragment[] | null;
};
export const MarketsTable = ({ data }: MarketsTableProps) => {
  const openAssetDetailsDialog = useAssetDetailsDialogStore(
    (state) => state.open
  );

  const navigate = useNavigate();

  const gridRef = useRef<AgGridReact>(null);
  useLayoutEffect(() => {
    const showColumnsOnDesktop = () => {
      gridRef.current?.columnApi.setColumnsVisible(
        ['id', 'state', 'asset'],
        window.innerWidth > BREAKPOINT_MD
      );
    };
    window.addEventListener('resize', showColumnsOnDesktop);
    return () => {
      window.removeEventListener('resize', showColumnsOnDesktop);
    };
  }, []);

  return (
    <AgGrid
      ref={gridRef}
      rowData={data}
      getRowId={({ data }: { data: MarketFieldsFragment }) => data.id}
      overlayNoRowsTemplate={t('This chain has no markets')}
      domLayout="autoHeight"
      defaultColDef={{
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
        filterParams: { buttons: ['reset'] },
        autoHeight: true,
      }}
      suppressCellFocus={true}
      onRowClicked={({ data, event }: RowClickedEvent) => {
        if ((event?.target as HTMLElement).tagName.toUpperCase() !== 'BUTTON') {
          navigate(data.id);
        }
      }}
    >
      <AgGridColumn
        colId="code"
        headerName={t('Code')}
        field="tradableInstrument.instrument.code"
      />
      <AgGridColumn
        colId="name"
        headerName={t('Name')}
        field="tradableInstrument.instrument.name"
      />
      <AgGridColumn
        headerName={t('Status')}
        field="state"
        hide={window.innerWidth <= BREAKPOINT_MD}
        valueGetter={({
          data,
        }: VegaValueGetterParams<MarketFieldsFragment, 'state'>) => {
          return data?.state ? MarketStateMapping[data?.state] : '-';
        }}
      />
      <AgGridColumn
        colId="asset"
        headerName={t('Settlement asset')}
        field="tradableInstrument.instrument.product.settlementAsset"
        hide={window.innerWidth <= BREAKPOINT_MD}
        cellRenderer={({
          value,
        }: VegaICellRendererParams<
          MarketFieldsFragment,
          'tradableInstrument.instrument.product.settlementAsset'
        >) =>
          value ? (
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(value.id, e.target as HTMLElement);
              }}
            >
              {value.symbol}
            </ButtonLink>
          ) : (
            ''
          )
        }
      />
      <AgGridColumn
        flex={2}
        headerName={t('Market ID')}
        field="id"
        hide={window.innerWidth <= BREAKPOINT_MD}
      />
      <AgGridColumn
        colId="actions"
        headerName=""
        field="id"
        cellRenderer={({
          value,
        }: VegaICellRendererParams<MarketFieldsFragment, 'id'>) =>
          value ? (
            <Link className="underline" to={value}>
              {t('View details')}
            </Link>
          ) : (
            ''
          )
        }
      />
    </AgGrid>
  );
};
