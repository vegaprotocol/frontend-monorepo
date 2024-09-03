import { useMemo } from 'react';
import {
  type AgGridReact,
  type AgGridReactProps,
  type AgReactUiProps,
} from 'ag-grid-react';
import { type ColDef } from 'ag-grid-community';
import {
  addDecimal,
  addDecimalsFormatNumber,
  formatNumber,
  getDateTimeFormat,
  isNumeric,
} from '@vegaprotocol/utils';
import {
  AgGrid,
  positiveClassNames,
  negativeClassNames,
  MarketNameCell,
  COL_DEFS,
  DateRangeFilter,
} from '@vegaprotocol/datagrid';
import {
  type VegaValueFormatterParams,
  type VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { forwardRef } from 'react';
import BigNumber from 'bignumber.js';
import { type Trade } from './fills-data-provider';
import { FillActionsDropdown } from './fill-actions-dropdown';
import { getAsset } from '@vegaprotocol/markets';
import { useT } from './use-t';
import { getFeesBreakdown, getRoleAndFees } from './fills-utils';

type Props = (AgGridReactProps | AgReactUiProps) & {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
};

export const FillsTable = forwardRef<AgGridReact, Props>(
  ({ partyId, onMarketClick, ...props }, ref) => {
    const t = useT();
    const columnDefs = useMemo<ColDef[]>(
      () => [
        {
          headerName: t('Market'),
          field: 'market.tradableInstrument.instrument.code',
          cellRenderer: 'MarketNameCell',
          cellRendererParams: { idPath: 'market.id', onMarketClick },
          pinned: true,
        },
        {
          headerName: t('Size'),
          type: 'rightAligned',
          field: 'size',
          cellClassRules: {
            [positiveClassNames]: ({ data }: { data: Trade }) => {
              const partySide = getPartySide(data, partyId);
              return partySide === 'buyer';
            },
            [negativeClassNames]: ({ data }: { data: Trade }) => {
              const partySide = getPartySide(data, partyId);
              return partySide === 'seller';
            },
          },
          valueFormatter: formatSize(partyId),
        },
        {
          headerName: t('Price'),
          field: 'price',
          valueFormatter: formatPrice,
          type: 'rightAligned',
        },
        {
          headerName: t('Notional'),
          field: 'price',
          valueFormatter: formatTotal,
          type: 'rightAligned',
        },
        {
          headerName: t('Role'),
          field: 'aggressor',
          valueFormatter: formatRole(partyId),
        },
        {
          headerName: t('Fee'),
          colId: 'fee',
          field: 'market',
          valueFormatter: formatFee(partyId),
          type: 'rightAligned',
        },
        {
          headerName: t('Fee Discount'),
          colId: 'fee-discount',
          field: 'market',
          valueFormatter: formatFeeDiscount(partyId),
          type: 'rightAligned',
          // return null to disable tooltip if fee discount is 0 or empty
          cellRenderer: ({
            value,
            valueFormatted,
          }: VegaICellRendererParams<Trade, 'market'>) => {
            return `${valueFormatted} ${(value && getAsset(value))?.symbol}`;
          },
        },
        {
          headerName: t('Date'),
          filter: DateRangeFilter,
          field: 'createdAt',
          valueFormatter: ({
            value,
          }: VegaValueFormatterParams<Trade, 'createdAt'>) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '';
          },
        },
        {
          colId: 'fill-actions',
          cellRenderer: ({ data }: VegaICellRendererParams<Trade, 'id'>) => {
            if (!data) return null;
            return (
              <FillActionsDropdown
                buyOrderId={data.buyOrder}
                sellOrderId={data.sellOrder}
                tradeId={data.id}
              />
            );
          },
          ...COL_DEFS.actions,
        },
      ],
      [onMarketClick, partyId, t]
    );
    return (
      <AgGrid
        ref={ref}
        columnDefs={columnDefs}
        defaultColDef={COL_DEFS.default}
        overlayNoRowsTemplate={t('No fills')}
        getRowId={({ data }) => data?.id}
        tooltipShowDelay={0}
        tooltipHideDelay={10000}
        components={{ MarketNameCell }}
        {...props}
      />
    );
  }
);

const formatPrice = ({
  value,
  data,
}: VegaValueFormatterParams<Trade, 'price'>) => {
  if (!data?.market || !isNumeric(value)) {
    return '-';
  }
  const asset = getAsset(data.market);
  const valueFormatted = addDecimalsFormatNumber(
    value,
    data?.market.decimalPlaces
  );
  return `${valueFormatted} ${asset.symbol}`;
};

const formatSize = (partyId: string) => {
  return ({ value, data }: VegaValueFormatterParams<Trade, 'size'>) => {
    if (!data?.market || !isNumeric(value)) {
      return '-';
    }
    let prefix = '';
    const partySide = getPartySide(data, partyId);

    if (partySide === 'buyer') {
      prefix = '+';
    } else if (partySide === 'seller') {
      prefix = '-';
    }

    const size = addDecimalsFormatNumber(
      value,
      data?.market.positionDecimalPlaces
    );
    return `${prefix}${size}`;
  };
};

const getPartySide = (
  data: Trade,
  partyId: string
): 'buyer' | 'seller' | undefined => {
  let result = undefined;
  if (data?.buyer.id === partyId) {
    result = 'buyer' as const;
  } else if (data?.seller.id === partyId) {
    result = 'seller' as const;
  }
  return result;
};

const formatTotal = ({
  value,
  data,
}: VegaValueFormatterParams<Trade, 'price'>) => {
  if (!data?.market || !isNumeric(value)) {
    return '-';
  }
  const { symbol: assetSymbol, decimals: assetDecimals } = getAsset(
    data.market
  );
  const size = new BigNumber(
    addDecimal(data?.size, data?.market.positionDecimalPlaces)
  );
  const price = new BigNumber(addDecimal(value, data?.market.decimalPlaces));
  const total = size.times(price).toString();
  const valueFormatted = formatNumber(total, assetDecimals);
  return `${valueFormatted} ${assetSymbol}`;
};

const formatRole = (partyId: string) => {
  return ({ data }: VegaValueFormatterParams<Trade, 'aggressor'>) => {
    if (!data) return '-';
    const { role } = getRoleAndFees({ data, partyId });
    return role;
  };
};

const formatFee = (partyId: string) => {
  return ({
    value: market,
    data,
  }: VegaValueFormatterParams<Trade, 'market'>) => {
    if (!market || !data) return '-';
    const asset = getAsset(market);
    const { fees: feesObj, role } = getRoleAndFees({ data, partyId });
    if (!feesObj) return '-';

    const { totalFee } = getFeesBreakdown(role, feesObj);
    const totalFees = addDecimalsFormatNumber(totalFee, asset.decimals);
    return `${totalFees} ${asset.symbol}`;
  };
};

const formatFeeDiscount = (partyId: string) => {
  return ({
    value: market,
    data,
  }: VegaValueFormatterParams<Trade, 'market'>) => {
    if (!market || !data) return '-';
    const asset = getAsset(market);
    const { fees: roleFees, role } = getRoleAndFees({ data, partyId });
    if (!roleFees) return '-';
    const { totalFeeDiscount } = getFeesBreakdown(role, roleFees);
    return addDecimalsFormatNumber(totalFeeDiscount, asset.decimals);
  };
};
