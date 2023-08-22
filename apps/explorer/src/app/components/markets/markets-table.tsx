import { useMemo } from 'react';
import type { MarketFieldsFragment } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
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

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        colId: 'code',
        headerName: t('Code'),
        field: 'tradableInstrument.instrument.code',
      },
      {
        colId: 'name',
        headerName: t('Name'),
        field: 'tradableInstrument.instrument.name',
      },
      {
        headerName: t('Status'),
        field: 'state',
        hide: window.innerWidth <= BREAKPOINT_MD,
        valueGetter: ({
          data,
        }: VegaValueGetterParams<MarketFieldsFragment>) => {
          return data?.state ? MarketStateMapping[data?.state] : '-';
        },
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        field: 'tradableInstrument.instrument.product.settlementAsset.symbol',
        hide: window.innerWidth <= BREAKPOINT_MD,
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<
          MarketFieldsFragment,
          'tradableInstrument.instrument.product.settlementAsset.symbol'
        >) => {
          const value = data && getAsset(data);
          return value ? (
            <ButtonLink
              onClick={(e) => {
                openAssetDetailsDialog(value.id, e.target as HTMLElement);
              }}
            >
              {value.symbol}
            </ButtonLink>
          ) : (
            ''
          );
        },
      },
      {
        flex: 2,
        headerName: t('Market ID'),
        field: 'id',
        hide: window.innerWidth <= BREAKPOINT_MD,
      },
      {
        colId: 'actions',
        headerName: '',
        field: 'id',
        cellRenderer: ({
          value,
        }: VegaICellRendererParams<MarketFieldsFragment, 'id'>) =>
          value ? (
            <Link className="underline" to={value}>
              {t('View details')}
            </Link>
          ) : (
            ''
          ),
      },
    ],
    [openAssetDetailsDialog]
  );

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
      columnDefs={columnDefs}
      suppressCellFocus={true}
      onRowClicked={({ data, event }: RowClickedEvent) => {
        if ((event?.target as HTMLElement).tagName.toUpperCase() !== 'BUTTON') {
          navigate(data.id);
        }
      }}
    />
  );
};

const getAsset = (
  data: MarketFieldsFragment
): {
  decimals: number | undefined;
  symbol: string;
  id: string;
} => {
  // TODO to handle baseAsset for Spots
  return 'settlementAsset' in data.tradableInstrument.instrument.product
    ? data?.tradableInstrument?.instrument?.product?.settlementAsset
    : {
        decimals: 0,
        symbol: '',
        id: '',
      };
};
