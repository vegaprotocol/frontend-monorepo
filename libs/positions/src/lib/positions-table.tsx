import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ColDef, ITooltipParams } from 'ag-grid-community';
import type {
  VegaValueFormatterParams,
  VegaValueGetterParams,
  TypedDataAgGrid,
  VegaICellRendererParams,
} from '@vegaprotocol/datagrid';
import {
  AgGridLazy as AgGrid,
  COL_DEFS,
  PriceFlashCell,
  signedNumberCssClassRules,
  MarketNameCell,
  ProgressBarCell,
  MarketProductPill,
  StackedCell,
} from '@vegaprotocol/datagrid';
import {
  ButtonLink,
  TooltipCellComponent,
  ExternalLink,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  volumePrefix,
  toBigNum,
  formatNumber,
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { Position } from './positions-data-providers';
import {
  MarketTradingMode,
  PositionStatus,
  PositionStatusMapping,
} from '@vegaprotocol/types';
import { DocsLinks } from '@vegaprotocol/environment';
import { PositionActionsDropdown } from './position-actions-dropdown';
import { LiquidationPrice } from './liquidation-price';

interface Props extends TypedDataAgGrid<Position> {
  onClose?: (data: Position) => void;
  onMarketClick?: (id: string, metaKey?: boolean) => void;
  style?: CSSProperties;
  isReadOnly: boolean;
  multipleKeys?: boolean;
  pubKeys?: Array<{ name: string; publicKey: string }> | null;
  pubKey?: string | null;
}

export const getRowId = ({ data }: { data: Position }) =>
  `${data.partyId}-${data.marketId}`;

const realisedPNLValueGetter = ({ data }: { data: Position }) => {
  return !data
    ? undefined
    : toBigNum(data.realisedPNL, data.assetDecimals).toNumber();
};

const unrealisedPNLValueGetter = ({ data }: { data: Position }) => {
  return !data
    ? undefined
    : toBigNum(data.unrealisedPNL, data.assetDecimals).toNumber();
};

const defaultColDef = {
  sortable: true,
  filter: true,
  filterParams: { buttons: ['reset'] },
  tooltipComponent: TooltipCellComponent,
  resizable: true,
};

export const PositionsTable = ({
  onClose,
  onMarketClick,
  multipleKeys,
  isReadOnly,
  pubKeys,
  pubKey,
  ...props
}: Props) => {
  return (
    <AgGrid
      overlayNoRowsTemplate={t('No positions')}
      getRowId={getRowId}
      tooltipShowDelay={500}
      defaultColDef={defaultColDef}
      components={{
        PriceFlashCell,
        ProgressBarCell,
        MarketNameCell,
      }}
      rowHeight={45}
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
              }
            : null,
          {
            headerName: t('Market'),
            field: 'marketCode',
            onCellClicked: ({ data }) => {
              if (!onMarketClick) return;
              onMarketClick(data.marketId);
            },
            cellRenderer: ({
              value,
              data,
            }: VegaICellRendererParams<Position, 'marketCode'>) => {
              if (!data || !value) return '-';
              return (
                <StackedCell
                  primary={value}
                  secondary={
                    <>
                      {data?.assetSymbol}
                      <MarketProductPill productType={data.productType} />
                    </>
                  }
                />
              );
            },
          },
          {
            headerName: t('Size / Notional'),
            field: 'openVolume',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            cellClassRules: signedNumberCssClassRules,
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: { data: Position }) => {
              return data?.openVolume === undefined
                ? undefined
                : toBigNum(
                    data?.openVolume,
                    data.positionDecimalPlaces
                  ).toNumber();
            },
            tooltipValueGetter: ({ data }: ITooltipParams<Position>) => {
              if (
                !data ||
                data.status === PositionStatus.POSITION_STATUS_UNSPECIFIED
              ) {
                return null;
              }
              return data.status;
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'openVolume'>): string => {
              if (!data?.openVolume) return '-';

              const vol = volumePrefix(
                addDecimalsFormatNumber(
                  data.openVolume,
                  data.positionDecimalPlaces
                )
              );

              return vol;
            },
            tooltipComponent: (args: ITooltipParams<Position>) => {
              if (!args.data) {
                return null;
              }
              const POSITION_RESOLUTION_LINK =
                DocsLinks?.POSITION_RESOLUTION ?? '';
              let primaryTooltip;
              switch (args.data.status) {
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
              switch (args.data.status) {
                case PositionStatus.POSITION_STATUS_CLOSED_OUT:
                  secondaryTooltip = t(
                    `You did not have enough %s collateral to meet the maintenance margin requirements for your position, so it was closed by the network.`,
                    args.data.assetSymbol
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
                <TooltipCellComponent
                  {...args}
                  value={
                    <>
                      <p className="mb-2">{primaryTooltip}</p>
                      <p className="mb-2">{secondaryTooltip}</p>
                      <p className="mb-2">
                        {t(
                          'Status: %s',
                          PositionStatusMapping[args.data.status]
                        )}
                      </p>
                      {POSITION_RESOLUTION_LINK && (
                        <ExternalLink href={POSITION_RESOLUTION_LINK}>
                          {t('Read more about position resolution')}
                        </ExternalLink>
                      )}
                    </>
                  }
                />
              );
            },
            cellRenderer: OpenVolumeCell,
          },
          {
            headerName: t('Entry / Mark'),
            field: 'markPrice',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            cellRenderer: ({
              data,
            }: VegaICellRendererParams<Position, 'markPrice'>) => {
              if (
                !data?.averageEntryPrice ||
                !data?.markPrice ||
                !data?.marketDecimalPlaces
              ) {
                return <>-</>;
              }

              if (
                data.marketTradingMode ===
                MarketTradingMode.TRADING_MODE_OPENING_AUCTION
              ) {
                return <>-</>;
              }

              const entry = addDecimalsFormatNumber(
                data.averageEntryPrice,
                data.marketDecimalPlaces
              );
              const mark = addDecimalsFormatNumber(
                data.markPrice,
                data.marketDecimalPlaces
              );
              return (
                <StackedCell
                  primary={entry}
                  secondary={
                    <PriceFlashCell
                      value={Number(data.markPrice)}
                      valueFormatted={mark}
                    />
                  }
                />
              );
            },
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data ||
                !data.markPrice ||
                data.marketTradingMode ===
                  MarketTradingMode.TRADING_MODE_OPENING_AUCTION
                ? undefined
                : toBigNum(data.markPrice, data.marketDecimalPlaces).toNumber();
            },
          },
          {
            headerName: t('Margin / Leverage'),
            colId: 'margin',
            type: 'rightAligned',
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: ({ data }: VegaValueGetterParams<Position>) => {
              return !data
                ? undefined
                : toBigNum(
                    data.marginAccountBalance,
                    data.assetDecimals
                  ).toNumber();
            },
            cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
              if (
                !data ||
                !data.marginAccountBalance ||
                !data.marketDecimalPlaces
              ) {
                return null;
              }
              const margin = addDecimalsFormatNumberQuantum(
                data.marginAccountBalance,
                data.assetDecimals,
                data.quantum
              );

              const lev = data?.currentLeverage ? data.currentLeverage : 1;
              const leverage = formatNumber(Math.max(1, lev), 1);
              return (
                <StackedCell primary={margin} secondary={leverage + 'x'} />
              );
            },
          },
          {
            colId: 'liquidationPrice',
            headerName: 'Liquidation',
            headerTooltip: t('Worst case liquidation price'),
            cellClass: 'font-mono text-right',
            type: 'rightAligned',
            // Cannot be sortable as data is fetched within the cell
            sortable: false,
            filter: false,
            cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
              if (!data) {
                return '-';
              }
              // The estimate order query API gives us the liquidation price in formatted by asset decimals.
              // We need to calculate it with asset decimals, but display it with market decimals precision until the API changes.
              return (
                <LiquidationPrice
                  marketId={data.marketId}
                  openVolume={data.openVolume}
                  collateralAvailable={data.totalBalance}
                  decimalPlaces={data.assetDecimals}
                  formatDecimals={data.marketDecimalPlaces}
                />
              );
            },
          },
          {
            headerName: t('Realised PNL'),
            field: 'realisedPNL',
            type: 'rightAligned',
            cellClassRules: signedNumberCssClassRules,
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: realisedPNLValueGetter,
            // @ts-ignore no type overlap, but the functions are identical
            tooltipValueGetter: realisedPNLValueGetter,
            tooltipComponent: (args: ITooltipParams) => {
              const LOSS_SOCIALIZATION_LINK =
                DocsLinks?.LOSS_SOCIALIZATION ?? '';

              if (!args.data) {
                return <>-</>;
              }

              const losses = parseInt(
                args.data?.lossSocializationAmount ?? '0'
              );

              if (losses <= 0) {
                // eslint-disable-next-line react/jsx-no-useless-fragment
                return <>{args.valueFormatted}</>;
              }

              const lossesFormatted = addDecimalsFormatNumber(
                args.data.lossSocializationAmount,
                args.data.assetDecimals
              );

              return (
                <TooltipCellComponent
                  {...args}
                  value={
                    <>
                      <p className="mb-2">
                        {t('Realised PNL: %s', args.value)}
                      </p>
                      <p className="mb-2">
                        {t(
                          'Lifetime loss socialisation deductions: %s',
                          lossesFormatted
                        )}
                      </p>
                      <p className="mb-2">
                        {t(
                          `You received less %s in gains that you should have when the market moved in your favour. This occurred because one or more other trader(s) were closed out and did not have enough funds to cover their losses, and the market's insurance pool was empty.`,
                          args.data.assetSymbol
                        )}
                      </p>
                      {LOSS_SOCIALIZATION_LINK && (
                        <ExternalLink href={LOSS_SOCIALIZATION_LINK}>
                          {t('Read more about loss socialisation')}
                        </ExternalLink>
                      )}
                    </>
                  }
                />
              );
            },
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'realisedPNL'>) => {
              return !data
                ? ''
                : addDecimalsFormatNumberQuantum(
                    data.realisedPNL,
                    data.assetDecimals,
                    data.quantum
                  );
            },
            headerTooltip: t(
              'Profit or loss is realised whenever your position is reduced to zero and the margin is released back to your collateral balance. P&L excludes any fees paid.'
            ),
            cellRenderer: PNLCell,
          },
          {
            headerName: t('Unrealised PNL'),
            field: 'unrealisedPNL',
            type: 'rightAligned',
            cellClassRules: signedNumberCssClassRules,
            cellClass: 'font-mono text-right',
            filter: 'agNumberColumnFilter',
            valueGetter: unrealisedPNLValueGetter,
            // @ts-ignore no type overlap but function can be identical
            tooltipValueGetter: unrealisedPNLValueGetter,
            valueFormatter: ({
              data,
            }: VegaValueFormatterParams<Position, 'unrealisedPNL'>) =>
              !data
                ? ''
                : addDecimalsFormatNumberQuantum(
                    data.unrealisedPNL,
                    data.assetDecimals,
                    data.quantum
                  ),
            headerTooltip: t(
              'Unrealised profit is the current profit on your open position. Margin is still allocated to your position.'
            ),
          },
          onClose && !isReadOnly
            ? {
                ...COL_DEFS.actions,
                cellRenderer: ({ data }: VegaICellRendererParams<Position>) => {
                  return (
                    <div className="flex items-center justify-end gap-2">
                      {data?.openVolume &&
                      data?.openVolume !== '0' &&
                      data.partyId === pubKey ? (
                        <ButtonLink
                          data-testid="close-position"
                          onClick={() => data && onClose(data)}
                          title={t('Close position')}
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
                minWidth: 55,
                maxWidth: 55,
              }
            : null,
        ];
        return columnDefs.filter<ColDef>(
          (colDef: ColDef | null): colDef is ColDef => colDef !== null
        );
      }, [isReadOnly, multipleKeys, onClose, onMarketClick, pubKey, pubKeys])}
      {...props}
    />
  );
};

export const PNLCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'realisedPNL'>) => {
  if (!data) {
    return <>-</>;
  }

  const losses = parseInt(data?.lossSocializationAmount ?? '0');
  if (losses <= 0) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{valueFormatted}</>;
  }

  return <WarningCell>{valueFormatted}</WarningCell>;
};

export const OpenVolumeCell = ({
  valueFormatted,
  data,
}: VegaICellRendererParams<Position, 'openVolume'>) => {
  if (!valueFormatted || !data || !data.notional) {
    return <>-</>;
  }

  const notional = addDecimalsFormatNumber(
    data.notional,
    data.marketDecimalPlaces
  );

  const cellContent = (
    <StackedCell primary={valueFormatted} secondary={notional} />
  );

  if (data.status === PositionStatus.POSITION_STATUS_UNSPECIFIED) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{cellContent}</>;
  }

  return (
    <WarningCell
      showIcon={
        // not sure why but data.status has become a union of all the enum values
        // rather than just being the enum itself
        (data.status as PositionStatus) !==
        PositionStatus.POSITION_STATUS_UNSPECIFIED
      }
    >
      {cellContent}
    </WarningCell>
  );
};

const WarningCell = ({
  children,
  showIcon = true,
}: {
  children: ReactNode;
  showIcon?: boolean;
}) => {
  return (
    <div className="flex items-center justify-end">
      {showIcon && (
        <span className="mr-2 text-black dark:text-white">
          <VegaIcon name={VegaIconNames.EXCLAIMATION_MARK} size={12} />
        </span>
      )}
      <span className="overflow-hidden whitespace-nowrap text-ellipsis">
        {children}
      </span>
    </div>
  );
};
