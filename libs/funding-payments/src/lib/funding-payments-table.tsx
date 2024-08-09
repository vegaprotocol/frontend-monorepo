import { useMemo } from 'react';
import {
  type AgGridReact,
  type AgGridReactProps,
  type AgReactUiProps,
} from 'ag-grid-react';
import { type ColDef } from 'ag-grid-community';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  isNumeric,
  toBigNum,
} from '@vegaprotocol/utils';

import {
  AgGrid,
  DateRangeFilter,
  MarketNameCell,
  negativeClassNames,
  positiveClassNames,
} from '@vegaprotocol/datagrid';
import type {
  VegaValueFormatterParams,
  VegaValueGetterParams,
} from '@vegaprotocol/datagrid';
import { forwardRef } from 'react';

import type { FundingPayment } from './funding-payments-data-provider';

import { getAsset } from '@vegaprotocol/markets';
import { cn } from '@vegaprotocol/utils';
import { useT } from './use-t';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

const defaultColDef = {
  resizable: true,
  sortable: true,
};

export type Props = (AgGridReactProps | AgReactUiProps) & {
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  fundingRate?: string | null;
};

const formatAmount = ({
  value,
  data,
}: VegaValueFormatterParams<FundingPayment, 'amount'>) => {
  if (!data?.market || !isNumeric(value)) {
    return '-';
  }
  const { symbol: assetSymbol, decimals: assetDecimals } = getAsset(
    data.market
  );
  const valueFormatted = addDecimalsFormatNumber(value, assetDecimals);
  return `${valueFormatted} ${assetSymbol}`;
};

export const FundingPaymentsTable = forwardRef<AgGridReact, Props>(
  ({ onMarketClick, ...props }, ref) => {
    const t = useT();
    const columnDefs = useMemo<ColDef[]>(
      () => [
        {
          headerName: t('Market'),
          field: 'market.tradableInstrument.instrument.code',
          cellRenderer: 'MarketNameCell',
          filter: true,
          cellRendererParams: { idPath: 'market.id', onMarketClick },
        },
        {
          headerName: t('Amount'),
          field: 'amount',
          valueFormatter: formatAmount,
          type: 'rightAligned',
          filter: 'agNumberColumnFilter',
          valueGetter: ({ data }: VegaValueGetterParams<FundingPayment>) =>
            data?.amount && data?.market
              ? toBigNum(data.amount, getAsset(data.market).decimals).toNumber()
              : 0,
          cellRenderer: ({ data }: { data: FundingPayment }) => {
            const tooltip = () => {
              const positive = !data?.amount?.startsWith('-');
              const negative = !!data?.amount?.startsWith('-');
              const fundingRateValue = props.fundingRate
                ? `${(Number(props.fundingRate) * 100).toFixed(4)}%`
                : '-';
              if (positive) {
                return t(
                  `The funding rate represents the difference between the mark price and the index price and drives alignment between the two. At the next funding settlement, longs will pay shorts at a rate of {{fundingRate}}.`,
                  {
                    fundingRate: fundingRateValue,
                  }
                );
              }
              if (negative) {
                return t(
                  `The funding rate represents the difference between the mark price and the index price and drives alignment between the two. At the next funding settlement, shorts will pay longs at a rate of {{fundingRate}}.`,
                  {
                    fundingRate: fundingRateValue,
                  }
                );
              }
              return null;
            };

            if (!data?.market || !isNumeric(data.amount)) {
              return '-';
            }
            const { symbol: assetSymbol, decimals: assetDecimals } = getAsset(
              data.market
            );
            const valueFormatted = addDecimalsFormatNumber(
              data.amount,
              assetDecimals
            );
            return (
              <Tooltip description={<span>{tooltip()}</span>}>
                <span>
                  <span
                    className={cn({
                      [positiveClassNames]: !data?.amount?.startsWith('-'),
                      [negativeClassNames]: !!data?.amount?.startsWith('-'),
                    })}
                  >
                    {valueFormatted}
                  </span>
                  {` ${assetSymbol}`}
                </span>
              </Tooltip>
            );
          },
        },
        {
          headerName: t('Date'),
          field: 'timestamp',
          type: 'rightAligned',
          filter: DateRangeFilter,
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<FundingPayment, 'timestamp'>) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '';
          },
        },
      ],
      [onMarketClick, props.fundingRate, t]
    );
    return (
      <AgGrid
        ref={ref}
        defaultColDef={defaultColDef}
        columnDefs={columnDefs}
        overlayNoRowsTemplate={t('No funding payments')}
        getRowId={({ data }: { data?: FundingPayment }) =>
          `${data?.marketId}-${data?.fundingPeriodSeq}`
        }
        components={{ MarketNameCell }}
        tooltipShowDelay={0}
        tooltipHideDelay={10000}
        {...props}
      />
    );
  }
);
