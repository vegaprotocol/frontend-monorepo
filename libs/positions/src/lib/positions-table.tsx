import classNames from 'classnames';
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  VegaValueFormatterParams,
  VegaValueGetterParams,
  TypedDataAgGrid,
  VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import { COL_DEFS } from '@vegaprotocol/datagrid';
import { ProgressBarCell } from '@vegaprotocol/datagrid';
import {
  AgGridLazy as AgGrid,
  DateRangeFilter,
  PriceFlashCell,
  signedNumberCssClass,
  signedNumberCssClassRules,
  MarketNameCell,
} from '@vegaprotocol/datagrid';
import {
  ButtonLink,
  Tooltip,
  TooltipCellComponent,
  ExternalLink,
  Icon,
  VegaIconNames,
  VegaIcon,
} from '@vegaprotocol/ui-toolkit';
import {
  volumePrefix,
  toBigNum,
  formatNumber,
  getDateTimeFormat,
  addDecimalsFormatNumber,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { Position } from './positions-data-providers';
import * as Schema from '@vegaprotocol/types';
import { PositionStatus, PositionStatusMapping } from '@vegaprotocol/types';
import { DocsLinks } from '@vegaprotocol/environment';
import { PositionActionsDropdown } from './position-actions-dropdown';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { LiquidationPrice } from './liquidation-price';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  onMarketClick?: (id: string, metaKey?: boolean) => void;
  style?: CSSProperties;
  isReadOnly: boolean;
  multipleKeys?: boolean;
  pubKeys?: VegaWalletContextShape['pubKeys'];
  pubKey?: VegaWalletContextShape['pubKey'];
}

export interface AmountCellProps {
  valueFormatted?: Pick<
    Position,
    'openVolume' | 'marketDecimalPlaces' | 'positionDecimalPlaces' | 'notional'
  >;
}

export const AmountCell = ({ valueFormatted }: AmountCellProps) => {
  if (!valueFormatted) {
    return null;
  }
  const { openVolume, positionDecimalPlaces, marketDecimalPlaces, notional } =
    valueFormatted;
  return valueFormatted && notional ? (
    <div className="leading-tight font-mono">
      <div
        className={classNames('text-right', signedNumberCssClass(openVolume))}
      >
        {volumePrefix(
          addDecimalsFormatNumber(openVolume, positionDecimalPlaces)
        )}
      </div>
      <div className="text-right">
        {addDecimalsFormatNumber(notional, marketDecimalPlaces)}
      </div>
    </div>
  ) : null;
};

AmountCell.displayName = 'AmountCell';

export const getRowId = ({ data }: { data: Position }) =>
  `${data.partyId}-${data.marketId}`;

export const PositionsTable = ({
  onClose,
  onMarketClick,
  multipleKeys,
  isReadOnly,
  pubKeys,
  pubKey,
  ...props
}: Props) => {
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate={t('No positions')}
      getRowId={getRowId}
      tooltipShowDelay={500}
      defaultColDef={{
        resizable: true,
        sortable: true,
        filter: true,
        filterParams: { buttons: ['reset'] },
        tooltipComponent: TooltipCellComponent,
      }}
      components={{
        AmountCell,
        PriceFlashCell,
        ProgressBarCell,
        MarketNameCell,
      }}
      {...props}
      columnDefs={useMemo<ColDef[]>(() => {
        const columnDefs: (ColDef | null)[] = [
          multipleKeys
            ? {
                headerName: t('Vega key'),
                field: 'partyId',
                valueGetter: ({ data }: VegaValueGetterParams<Position>) =>
                  (data?.partyId &&
                    pubKeys &&
                    pubKeys.find((key) => key.publicKey === data.partyId)
                      ?.name) ||
                  data?.partyId,
                minWidth: 190,
              }
            : null,
          {
            headerName: t('Market'),
            field: 'marketName',
            cellRenderer: 'MarketNameCell',
            cellRendererParams: { idPath: 'marketId', onMarketClick },
            minWidth: 190,
          },
          {
            headerName: t('Notional'),
            headerTooltip: t('Mark price x open volume.'),
            field: 'notional',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data?.notional
                ? undefined
                : toBigNum(data.notional, data.marketDecimalPlaces).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'notional'>) => {
              return !data || !data.notional
                ? '-'
                : addDecimalsFormatNumber(
                    data.notional,
                    data.marketDecimalPlaces
                  );
            },
            minWidth: 80,
          },
          {
            headerName: t('Open volume'),
            field: 'openVolume',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            cellClassRules: signedNumberCssClassRules,
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return data?.openVolume === undefined
                ? undefined
                : toBigNum(
                    data?.openVolume,
                    data.positionDecimalPlaces
                  ).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'openVolume'>): string => {
              return data?.openVolume === undefined
                ? ''
                : volumePrefix(
                    addDecimalsFormatNumber(
                      data.openVolume,
                      data.positionDecimalPlaces
                    )
                  );
            },
            cellRenderer: OpenVolumeCell,
            minWidth: 100,
          },
          {
            headerName: t('Mark price'),
            field: 'markPrice',
            type: 'rightAligned',
            cellRenderer: PriceFlashCell,
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data ||
                !data.markPrice ||
                data.marketTradingMode ===
                  Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
                ? undefined
                : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'markPrice'>) => {
              if (!data) {
                return '';
              }
              if (
                !data.markPrice ||
                data.marketTradingMode ===
                  Schema.MarketTradingMode.TRADING_MODE_OPENING_AUCTION
              ) {
                return '-';
              }
              return addDecimalsFormatNumber(
                data.markPrice,
                data.marketDecimalPlaces
              );
            },
            minWidth: 100,
          },
          {
            headerName: t('Liquidation price'),
            colId: 'liquidationPrice',
            type: 'rightAligned',
            cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
              if (!data) return null;
              return (
                <LiquidationPrice
                  marketId={data.marketId}
                  openVolume={data.openVolume}
                  collateralAvailable={data.totalBalance}
                  decimalPlaces={data.decimals}
                  formatDecimals={data.marketDecimalPlaces}
                />
              );
            },
          },
          {
            headerName: t('Settlement asset'),
            field: 'assetSymbol',
            colId: 'asset',
            minWidth: 100,
            cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
              if (!data) return null;
              return (
                <ButtonLink
                  title={t('View settlement asset details')}
                  onClick={(e) => {
                    openAssetDetailsDialog(
                      data.assetId,
                      e.target as HTMLElement
                    );
                  }}
                >
                  {data?.assetSymbol}
                </ButtonLink>
              );
            },
          },
          {
            headerName: t('Entry price'),
            field: 'averageEntryPrice',
            type: 'rightAligned',
            cellRenderer: PriceFlashCell,
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return data?.markPrice === undefined || !data
                ? undefined
                : toBigNum(
                    data.averageEntryPrice,
                    data.marketDecimalPlaces
                  ).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<
              Position,
              'averageEntryPrice'
            >): string => {
              if (!data) {
                return '';
              }
              return addDecimalsFormatNumber(
                data.averageEntryPrice,
                data.marketDecimalPlaces
              );
            },
            minWidth: 100,
          },
          multipleKeys
            ? null
            : {
                headerName: t('Leverage'),
                field: 'currentLeverage',
                type: 'rightAligned',
                filter: 'agNumberColumnFilter',
                cellRenderer: PriceFlashCell,
                valueFormatter: ({
                  value,
                }: VegaValueFormatterParams<Position, 'currentLeverage'>) =>
                  value === undefined ? '' : formatNumber(value.toString(), 1),
                minWidth: 100,
              },
          multipleKeys
            ? null
            : {
                headerName: t('Margin allocated'),
                field: 'marginAccountBalance',
                type: 'rightAligned',
                filter: 'agNumberColumnFilter',
                cellRenderer: PriceFlashCell,
                valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
                  return !data
                    ? undefined
                    : toBigNum(
                        data.marginAccountBalance,
                        data.decimals
                      ).toNumber();
                },
                valueFormatter: ({
                  data,
                }: VegaValueFormatterParams<
                  Position,
                  'marginAccountBalance'
                >): string => {
                  if (!data) {
                    return '';
                  }
                  return addDecimalsFormatNumber(
                    data.marginAccountBalance,
                    data.decimals
                  );
                },
                minWidth: 100,
              },
          {
            headerName: t('Realised PNL'),
            field: 'realisedPNL',
            type: 'rightAligned',
            cellClassRules: signedNumberCssClassRules,
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data
                ? undefined
                : toBigNum(data.realisedPNL, data.decimals).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'realisedPNL'>) => {
              return !data
                ? ''
                : addDecimalsFormatNumber(data.realisedPNL, data.decimals);
            },
            headerTooltip: t(
              'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
            ),
            cellRenderer: PNLCell,
            minWidth: 100,
          },
          {
            headerName: t('Unrealised PNL'),
            field: 'unrealisedPNL',
            type: 'rightAligned',
            cellClassRules: signedNumberCssClassRules,
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data
                ? undefined
                : toBigNum(data.unrealisedPNL, data.decimals).toNumber();
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'unrealisedPNL'>) =>
              !data
                ? ''
                : addDecimalsFormatNumber(data.unrealisedPNL, data.decimals),
            headerTooltip: t(
              'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
            ),
            cellRenderer: PNLCell,
            minWidth: 100,
          },
          {
            headerName: t('Updated'),
            field: 'updatedAt',
            type: 'rightAligned',
            filter: DateRangeFilter,
            valueFormatter: ({
              value,
            }: VegaValueFormatterParams<Position, 'updatedAt'>) => {
              if (!value) {
                return '';
              }
              return getDateTimeFormat().format(new Date(value));
            },
            minWidth: 150,
          },
          onClose && !isReadOnly
            ? {
                ...COL_DEFS.actions,
                cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
                  return (
                    <div className="flex gap-2 items-center justify-end">
                      {data?.openVolume &&
                      data?.openVolume !== '0' &&
                      data.partyId === pubKey ? (
                        <ButtonLink
                          data-testid="close-position"
                          onClick={() => data && onClose(data)}
                        >
                          <VegaIcon name={VegaIconNames.CROSS} size={16} />
                        </ButtonLink>
                      ) : null}
                      {data?.assetId && (
                        <PositionActionsDropdown assetId={data?.assetId} />
                      )}
                    </div>
                  );
                },
                minWidth: 75,
                maxWidth: 75,
              }
            : null,
        ];
        return columnDefs.filter<ColDef>(
          (colDef: ColDef | null): colDef is ColDef => colDef !== null
        );
      }, [
        isReadOnly,
        multipleKeys,
        onClose,
        onMarketClick,
        openAssetDetailsDialog,
        pubKey,
        pubKeys,
      ])}
    />
  );
};

export default PositionsTable;

export const PNLCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'realisedPNL'>) => {
  const LOSS_SOCIALIZATION_LINK = DocsLinks?.LOSS_SOCIALIZATION ?? '';

  if (!data) {
    return <>-</>;
  }

  const losses = parseInt(data?.lossSocializationAmount ?? '0');
  if (losses <= 0) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{valueFormatted}</>;
  }

  const lossesFormatted = addDecimalsFormatNumber(
    data.lossSocializationAmount,
    data.decimals
  );

  return (
    <WarningCell
      tooltipContent={
        <>
          <p className="mb-2">
            {t('Lifetime loss socialisation deductions: %s', lossesFormatted)}
          </p>
          <p className="mb-2">
            {t(
              `You received less %s in gains that you should have when the market moved in your favour. This occurred because one or more other trader(s) were closed out and did not have enough funds to cover their losses, and the market's insurance pool was empty.`,
              [data.assetSymbol]
            )}
          </p>
          {LOSS_SOCIALIZATION_LINK && (
            <ExternalLink href={LOSS_SOCIALIZATION_LINK}>
              {t('Read more about loss socialisation')}
            </ExternalLink>
          )}
        </>
      }
    >
      {valueFormatted}
    </WarningCell>
  );
};

export const OpenVolumeCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'openVolume'>) => {
  if (!data) {
    return <>-</>;
  }

  const POSITION_RESOLUTION_LINK = DocsLinks?.POSITION_RESOLUTION ?? '';

  let primaryTooltip;
  switch (data.status) {
    case PositionStatus.POSITION_STATUS_CLOSED_OUT:
      primaryTooltip = t('Your position was closed.');
      break;
    case PositionStatus.POSITION_STATUS_ORDERS_CLOSED:
      primaryTooltip = t('Your open orders were cancelled.');
      break;
    case PositionStatus.POSITION_STATUS_DISTRESSED:
      primaryTooltip = t('Your position is distressed.');
      break;
  }

  let secondaryTooltip;
  switch (data.status) {
    case PositionStatus.POSITION_STATUS_CLOSED_OUT:
      secondaryTooltip = t(
        `You did not have enough %s collateral to meet the maintenance margin requirements for your position, so it was closed by the network.`,
        [data.assetSymbol]
      );
      break;
    case PositionStatus.POSITION_STATUS_ORDERS_CLOSED:
      secondaryTooltip = t(
        'The position was distressed, but removing open orders from the book brought the margin level back to a point where the open position could be maintained.'
      );
      break;
    case PositionStatus.POSITION_STATUS_DISTRESSED:
      secondaryTooltip = t(
        'The position was distressed, but could not be closed out - orders were removed from the book, and the open volume will be closed out once there is sufficient volume on the book.'
      );
      break;
    default:
      secondaryTooltip = t('Maintained by network');
  }
  return (
    <WarningCell
      showIcon={data.status !== PositionStatus.POSITION_STATUS_UNSPECIFIED}
      tooltipContent={
        <>
          <p className="mb-2">{primaryTooltip}</p>
          <p className="mb-2">{secondaryTooltip}</p>
          <p className="mb-2">
            {t('Status: %s', PositionStatusMapping[data.status])}
          </p>
          {POSITION_RESOLUTION_LINK && (
            <ExternalLink href={POSITION_RESOLUTION_LINK}>
              {t('Read more about position resolution')}
            </ExternalLink>
          )}
        </>
      }
    >
      {valueFormatted}
    </WarningCell>
  );
};

const WarningCell = ({
  children,
  tooltipContent,
  showIcon = true,
}: {
  children: ReactNode;
  tooltipContent: ReactNode;
  showIcon?: boolean;
}) => {
  return (
    <Tooltip description={tooltipContent}>
      <div className="w-full flex items-center justify-between underline decoration-dashed underline-offest-2">
        <span className="text-black dark:text-white mr-1">
          {showIcon && <Icon name="warning-sign" size={3} />}
        </span>
        <span className="text-ellipsis overflow-hidden">{children}</span>
      </div>
    </Tooltip>
  );
};
