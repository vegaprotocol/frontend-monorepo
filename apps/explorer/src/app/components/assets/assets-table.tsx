import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { AssetTypeMapping, AssetStatusMapping } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaICellRendererParams } from '@vegaprotocol/ui-toolkit';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useRef, useLayoutEffect } from 'react';
import { BREAKPOINT_MD } from '../../config/breakpoints';

type AssetsTableProps = {
  data: AssetFieldsFragment[] | null;
};
export const AssetsTable = ({ data }: AssetsTableProps) => {
  const openAssetDetailsDialog = useAssetDetailsDialogStore(
    (state) => state.open
  );

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
      suppressCellFocus={true}
      onGridReady={() => {
        showColumnsOnDesktop();
      }}
    >
      <AgGridColumn headerName={t('Symbol')} field="symbol" />
      <AgGridColumn headerName={t('Name')} field="name" />
      <AgGridColumn flex="2" headerName={t('ID')} field="id" />
      <AgGridColumn
        colId="type"
        headerName={t('Type')}
        field="source.__typename"
        valueFormatter={({ value }: { value?: string }) =>
          value && AssetTypeMapping[value].value
        }
      />
      <AgGridColumn
        headerName={t('Status')}
        field="status"
        valueFormatter={({ value }: { value?: string }) =>
          value && AssetStatusMapping[value].value
        }
      />
      <AgGridColumn
        colId="actions"
        headerName=""
        sortable={false}
        filter={false}
        resizable={false}
        wrapText={true}
        field="id"
        cellRenderer={({
          value,
        }: VegaICellRendererParams<AssetFieldsFragment, 'id'>) =>
          value ? (
            <div className="pb-1">
              <ButtonLink
                onClick={(e) => {
                  openAssetDetailsDialog(value, e.target as HTMLElement);
                }}
              >
                {t('View details')}
              </ButtonLink>{' '}
              <span className="max-md:hidden">
                <ButtonLink
                  onClick={(e) => {
                    openAssetDetailsDialog(
                      value,
                      e.target as HTMLElement,
                      true
                    );
                  }}
                >
                  {t('View JSON')}
                </ButtonLink>
              </span>
            </div>
          ) : (
            ''
          )
        }
      />
    </AgGrid>
  );
};
