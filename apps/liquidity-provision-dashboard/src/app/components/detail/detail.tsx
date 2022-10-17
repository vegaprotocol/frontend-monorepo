import { useCallback, useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import type { AgGridReact as AgGridReactType } from 'ag-grid-react';
import type {
  GroupCellRendererParams,
  ValueFormatterParams,
  GetRowIdParams,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { formatNumber, t } from '@vegaprotocol/react-helpers';
import { Icon, AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Market } from '@vegaprotocol/liquidity';
import {
  useMarketsLiquidity,
  useLiquidityProvision,
} from '@vegaprotocol/liquidity';
import {
  MarketTradingModeMapping,
  MarketTradingMode,
  AuctionTrigger,
  AuctionTriggerMapping,
} from '@vegaprotocol/types';

// TODO: use css file
const agGridVariables = `
  .ag-theme-alpine {
    --ag-line-height: 24px;
    --ag-row-hover-color: transparent;
    --ag-header-background-color: transparent;
    --ag-odd-row-background-color: transparent;
    --ag-header-foreground-color: #626262;
    --ag-secondary-foreground-color: #626262;
    --ag-font-family: AlphaLyrae, "Helvetica Neue", -apple-system,;
    --ag-font-size: 16px;
    --ag-background-color: transparent;
    --ag-range-selection-border-color: transparent;

    font-family: AlphaLyrae, Helvetica Neue, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .ag-theme-alpine .ag-cell {
    display: flex;
  }

  .ag-theme-alpine .ag-header {
    border-bottom: 1px solid #A7A7A7;
    font-size: 15px;
    line-height: 96%;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  .ag-theme-alpine .ag-root-wrapper {
    border: none;
  }

  .ag-theme-alpine .ag-header-row {
    font-weight: 500;
  }

  .ag-theme-alpine .ag-row {
    border: none;
    border-bottom: 1px solid #BFCCD6;
    font-size: 12px;
  }

  .ag-theme-alpine .ag-root-wrapper-body.ag-layout-normal {
    height: auto;
  }
`;

export const Detail = () => {
  const gridRef = useRef<AgGridReactType | null>(null);

  const [details, setDetails] = useState({});
  const { marketId } = useParams<{ marketId: string }>();

  console.log('marketId: ', marketId);
  const {
    data: lpData,
    error,
    loading: lpLoading,
  } = useLiquidityProvision({ marketId });

  const localData = lpData;
  console.log('localData: ', localData);
  //   useEffect(() => {
  //     setDetails({ liquidityData: lpData });
  //   }, [lpData]);

  const getRowId = useCallback(({ data }: GetRowIdParams) => data.party, []);

  return (
    <AsyncRenderer loading={lpLoading} error={error} data={lpData}>
      <style>{agGridVariables}</style>
      <div className="px-16 py-20">
        <div className="mb-6">
          <Link to="/">
            <Icon name="chevron-left" className="mr-2" />
            <span className="underline font-alpha text-lg font-medium">
              {t('Liquidity opportunities')}
            </span>
          </Link>
        </div>
        <h1 className="font-alpha text-5xl mb-8">{lpData.name}</h1>
        <p className="font-alpha text-4xl mb-12">{lpData.symbol}</p>
        <h2 className="font-alpha text-2xl mb-4">
          {t('Current Liquidity Provision')}
        </h2>
        <AgGridReact
          rowData={localData.liquidityProviders}
          className="ag-theme-alpine h-full"
          defaultColDef={{
            resizable: true,
            sortable: true,
            unSortIcon: true,
            cellClass: ['flex', 'flex-col', 'justify-center'],
          }}
          getRowId={getRowId}
          rowHeight={92}
          ref={gridRef}
        >
          <AgGridColumn headerName={t('LPs')} field="party" flex="1" />
          <AgGridColumn headerName={t('Time in market')} field="createdAt" />
          <AgGridColumn headerName={t('Galps')} field="Galps" />
          <AgGridColumn
            headerName={t('committed bond/stake')}
            field="commitmentAmount"
          />
          <AgGridColumn headerName={t('Margin Req.')} field="margin" />
          <AgGridColumn headerName={t('24h Fees')} field="fees" />
          <AgGridColumn headerName={t('Fee level')} field="fee" />

          <AgGridColumn headerName={t('APY')} field="apy" />
        </AgGridReact>
      </div>
    </AsyncRenderer>
  );
};
