import orderBy from 'lodash/orderBy';
import { useNavigate } from 'react-router-dom';
import { useMarkets, isActiveMarket } from '@vegaprotocol/rest';
import type { vegaMarket } from '@vegaprotocol/rest-clients/dist/trading-data';
import type { ICellRendererParams } from 'ag-grid-community';
import filter from 'lodash/filter';
import { t } from '../../../lib/use-t';
import { Links } from '../../../lib/links';
import { AgGrid } from '@vegaprotocol/datagrid';
import { EmblemByMarket } from '@vegaprotocol/emblem';
import { HeaderPage } from '../../../components/header-page';

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
      <HeaderPage>{t('POOLS_TITLE')}</HeaderPage>

      <p className="w-3/5">{t('POOLS_DESCRIPTION')}</p>

      <div className="h-full border rounded border-gs-300 dark:border-gs-700">
        <AgGrid
          rowData={rowData}
          domLayout="autoHeight"
          rowClass={
            '!border-b !last:border-b-0 mb-1 border-gs-200 dark:border-gs-800'
          }
          rowHeight={60}
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
                data,
              }: ICellRendererParams<vegaMarket, string>) => {
                return (
                  <div className="cursor-pointer flex gap-2 items-center">
                    {data?.id && <EmblemByMarket market={data?.id} />}
                    <span>{value}</span>
                  </div>
                );
              },
            },
          ]}
          onRowClicked={(e) => {
            const marketId = e.data?.id;
            if (marketId) {
              navigate(Links.AMM_POOL(marketId));
            }
          }}
        />
      </div>
    </>
  );
};
