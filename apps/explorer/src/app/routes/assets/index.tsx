import { t } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import type { VegaICellRendererParams } from '@vegaprotocol/ui-toolkit';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  AssetStatusMapping,
  AssetTypeMapping,
  useAssetDetailsDialogStore,
} from '@vegaprotocol/assets';
import { useAssetsDataProvider } from '@vegaprotocol/assets';

import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { useRef } from 'react';

const Assets = () => {
  useDocumentTitle(['Assets']);
  useScrollToLocation();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const { data, loading, error } = useAssetsDataProvider();
  const ref = useRef<AgGridReact>(null);
  const table = (
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
    >
      <AgGridColumn headerName={t('Symbol')} field="symbol" />
      <AgGridColumn headerName={t('Name')} field="name" />
      <AgGridColumn headerName={t('ID')} field="id" />
      <AgGridColumn
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
        headerName=""
        sortable={false}
        filter={false}
        field="id"
        cellRenderer={({
          value,
        }: VegaICellRendererParams<AssetFieldsFragment, 'id'>) =>
          value ? (
            <>
              <ButtonLink
                onClick={(e) => {
                  openAssetDetailsDialog(value, e.target as HTMLElement);
                }}
              >
                {t('View details')}
              </ButtonLink>{' '}
              <ButtonLink
                onClick={(e) => {
                  openAssetDetailsDialog(value, e.target as HTMLElement, true);
                }}
              >
                {t('View JSON')}
              </ButtonLink>
            </>
          ) : (
            ''
          )
        }
      />
    </AgGrid>
  );

  return (
    <section>
      <RouteTitle data-testid="assets-header">{t('Assets')}</RouteTitle>
      <AsyncRenderer
        noDataMessage={t('This chain has no assets')}
        data={data}
        loading={loading}
        error={error}
      >
        <div className="h-full relative">{table}</div>
      </AsyncRenderer>
    </section>
  );
};

export default Assets;
