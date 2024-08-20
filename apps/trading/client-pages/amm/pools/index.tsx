import orderBy from 'lodash/orderBy';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { useMarkets, isActiveMarket } from '@vegaprotocol/rest';

import type { vegaMarket } from '@vegaprotocol/rest-clients/dist/trading-data';
import type { ICellRendererParams } from 'ag-grid-community';
import filter from 'lodash/filter';
import { t } from '../../../lib/use-t';
import { Links } from '../../../lib/links';

export const Pools = () => {
  const { data } = useMarkets();
  const markets = Array.from(data || []).map(([, v]) => v);
  const navigate = useNavigate();

  const rowData = orderBy(
    filter(markets, isActiveMarket),
    (m) => m.code,
    'asc'
  );

  return (
    <>
      <h1 className="text-5xl">{t('POOLS_TITLE')}</h1>

      <p className="w-3/5">{t('POOLS_DESCRIPTION')}</p>

      <div className="ag-theme-quartz-auto-dark">
        <AgGridReact
          rowData={rowData}
          domLayout="autoHeight"
          suppressDragLeaveHidesColumns
          overlayLoadingTemplate={t('TABLE_LOADING')}
          overlayNoRowsTemplate={t('TABLE_NO_DATA')}
          columnDefs={[
            {
              headerName: t('POOLS_TABLE_TH_NAME'),
              field: 'code',
              flex: 1,
              cellRenderer: ({
                value,
              }: ICellRendererParams<vegaMarket, string>) => {
                return <div className="cursor-pointer">{value}</div>;
              },
            },
          ]}
          onRowClicked={(e) => {
            const marketId = e.data?.id;
            if (marketId) {
              navigate(Links.POOLS_MARKET(marketId));
            }
          }}
        />
      </div>
    </>
  );
};
