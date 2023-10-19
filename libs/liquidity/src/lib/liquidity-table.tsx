import { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  addDecimalsFormatNumberQuantum,
  formatNumberPercentage,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { TypedDataAgGrid } from '@vegaprotocol/datagrid';
import { AgGrid } from '@vegaprotocol/datagrid';
import {
  CopyWithTooltip,
  Tooltip,
  TooltipCellComponent,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';
import type {
  ColGroupDef,
  ITooltipParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import BigNumber from 'bignumber.js';
import type { LiquidityProvisionStatus } from '@vegaprotocol/types';
import { LiquidityProvisionStatusMapping } from '@vegaprotocol/types';
import type { LiquidityProvisionData } from './liquidity-data-provider';

const percentageFormatter = ({ value }: ValueFormatterParams) => {
  if (!value) return '-';
  return formatNumberPercentage(new BigNumber(value).times(100), 2) || '-';
};

const copyCellRenderer = ({ value }: { value?: string | null }) => {
  if (!value) return '-';
  return (
    <CopyWithTooltip data-testid="copy-to-clipboard" text={value}>
      <button className="flex gap-1">
        <Tooltip description={value}>
          <span className="break-words">{truncateMiddle(value)}</span>
        </Tooltip>
        <VegaIcon name={VegaIconNames.COPY} size={12} />
      </button>
    </CopyWithTooltip>
  );
};

const dateValueFormatter = ({ value }: { value?: string | null }) => {
  if (!value) {
    return '-';
  }
  return getDateTimeFormat().format(new Date(value));
};

const defaultColDef = {
  resizable: true,
  sortable: true,
  tooltipComponent: TooltipCellComponent,
};

export interface LiquidityTableProps
  extends TypedDataAgGrid<LiquidityProvisionData> {
  symbol?: string;
  assetDecimalPlaces?: number;
  stakeToCcyVolume: string | null;
  quantum?: string | number;
}

export const LiquidityTable = ({
  symbol = '',
  assetDecimalPlaces,
  stakeToCcyVolume,
  quantum,
  ...props
}: LiquidityTableProps) => {
  const colDefs = useMemo(() => {
    const assetDecimalsFormatter = ({ value }: ITooltipParams) => {
      if (!value) return '-';
      return `${addDecimalsFormatNumber(value, assetDecimalPlaces ?? 0)}`;
    };

    const assetDecimalsQuantumFormatter = ({ value }: ValueFormatterParams) => {
      if (!value) return '-';
      return `${addDecimalsFormatNumberQuantum(
        value,
        assetDecimalPlaces ?? 0,
        quantum ?? 0
      )}`;
    };

    const stakeToCcyVolumeFormatter = ({ value }: ITooltipParams) => {
      if (!value) return '-';
      const newValue = new BigNumber(value)
        .times(Number(stakeToCcyVolume) || 1)
        .toString();
      return `${addDecimalsFormatNumber(newValue, assetDecimalPlaces ?? 0)}`;
    };

    const stakeToCcyVolumeQuantumFormatter = ({
      value,
    }: ValueFormatterParams) => {
      if (!value) return '-';
      const newValue = new BigNumber(value)
        .times(Number(stakeToCcyVolume) || 1)
        .toString();
      return `${addDecimalsFormatNumberQuantum(
        newValue,
        assetDecimalPlaces ?? 0,
        quantum ?? 0
      )}`;
    };

    const defs: ColGroupDef[] = [
      {
        headerName: '',
        children: [
          {
            headerName: t('Party'),
            field: 'partyId',
            headerTooltip: t(
              'The public key of the party making this commitment.'
            ),
            cellRenderer: copyCellRenderer,
          },
        ],
      },
      {
        headerName: t('Commitment details'),
        marryChildren: true,
        children: [
          {
            headerName: t(`Commitment (${symbol})`),
            field: 'commitmentAmount',
            type: 'rightAligned',
            headerTooltip: t(
              'The amount committed to the market by this liquidity provider.'
            ),
            valueFormatter: assetDecimalsQuantumFormatter,
            tooltipValueGetter: assetDecimalsFormatter,
          },
          {
            headerName: t('Obligation'),
            field: 'commitmentAmount',
            type: 'rightAligned',
            headerTooltip: t(
              `The liquidity provider's obligation to the market, calculated as the liquidity commitment amount multiplied by the value of the stake_to_ccy_volume network parameter to convert into units of liquidity volume. The obligation can be met by a combination of LP orders and limit orders on the order book.`
            ),
            valueFormatter: stakeToCcyVolumeQuantumFormatter,
            tooltipValueGetter: stakeToCcyVolumeFormatter,
            columnGroupShow: 'open',
          },
          {
            headerName: t('Fee'),
            headerTooltip: t(
              'The fee percentage (per trade) proposed by each liquidity provider.'
            ),
            field: 'fee',
            type: 'rightAligned',
            valueFormatter: percentageFormatter,
            columnGroupShow: 'open',
          },
          {
            headerName: t('Adjusted stake share'),
            field: 'feeShare.virtualStake',
            type: 'rightAligned',
            headerTooltip: t('The virtual stake of the liquidity provider.'),

            valueFormatter: assetDecimalsQuantumFormatter,
            tooltipValueGetter: assetDecimalsFormatter,
            columnGroupShow: 'open',
          },
          {
            headerName: t(`Share`),
            field: 'feeShare.equityLikeShare',
            type: 'rightAligned',
            headerTooltip: t(
              'The equity-like share of liquidity of the market used to determine allocation of LP fees. Calculated based on share of total liquidity, with a premium added for length of commitment.'
            ),
            valueFormatter: percentageFormatter,
            columnGroupShow: 'open',
          },
        ],
      },
      {
        headerName: t('Live liquidity details'),
        marryChildren: true,
        children: [
          {
            headerName: t('Live supplied liquidity'),
            field: 'balance',
            type: 'rightAligned',
            headerTooltip: t(
              `The amount of liquidity volume supplied by the LP order in order to meet the obligation. If the obligation is already met in full by other limit orders from the same Vega key the LP order is not required and this value will be zero. Also note if the target stake for the market is less than the obligation the full value of the obligation may not be required.`
            ),
            valueFormatter: stakeToCcyVolumeQuantumFormatter,
            tooltipValueGetter: stakeToCcyVolumeFormatter,
            columnGroupShow: 'open',
          },
          {
            headerName: t(`Live time fraction on book`),
            field: 'sla.currentEpochFractionOfTimeOnBook',
            type: 'rightAligned',
            headerTooltip: t('Current epoch fraction of time on the book.'),
            valueFormatter: percentageFormatter,
          },
          {
            headerName: t('Live liquidity quality score (%)'),
            field: 'feeShare.averageScore',
            type: 'rightAligned',
            headerTooltip: t('The average score of the liquidity provider.'),
            valueFormatter: percentageFormatter,
            columnGroupShow: 'open',
          },
        ],
      },
      {
        headerName: t('Last epoch SLA details'),
        marryChildren: true,
        children: [
          {
            headerName: t(`Last time fraction on the book`),
            field: 'sla.lastEpochFractionOfTimeOnBook',
            type: 'rightAligned',
            headerTooltip: t('Last epoch fraction of time on the book.'),
            valueFormatter: percentageFormatter,
          },
          {
            headerName: t(`Last fee penalty`),
            field: 'sla.lastEpochFeePenalty',
            type: 'rightAligned',
            headerTooltip: t('Last epoch fee penalty.'),
            valueFormatter: percentageFormatter,
            columnGroupShow: 'open',
          },
          {
            headerName: t(`Last bond penalty`),
            field: 'sla.lastEpochBondPenalty',
            type: 'rightAligned',
            headerTooltip: t('Last epoch bond penalty.'),
            valueFormatter: percentageFormatter,
            columnGroupShow: 'open',
          },
        ],
      },
      {
        headerName: '',
        marryChildren: true,
        children: [
          {
            headerName: t('Status'),
            headerTooltip: t('The current status of this liquidity provision.'),
            field: 'status',
            valueFormatter: ({ value }) => {
              if (!value) return value;
              return LiquidityProvisionStatusMapping[
                value as LiquidityProvisionStatus
              ];
            },
          },
          {
            headerName: t('Created'),
            headerTooltip: t(
              'The date and time this liquidity provision was created.'
            ),
            field: 'createdAt',
            type: 'rightAligned',
            valueFormatter: dateValueFormatter,
          },
          {
            headerName: t('Updated'),
            headerTooltip: t(
              'The date and time this liquidity provision was last updated.'
            ),
            field: 'updatedAt',
            type: 'rightAligned',
            valueFormatter: dateValueFormatter,
          },
        ],
      },
    ];
    return defs;
  }, [assetDecimalPlaces, quantum, stakeToCcyVolume, symbol]);
  return (
    <AgGrid
      overlayNoRowsTemplate={t('No liquidity provisions')}
      getRowId={({ data }: { data: LiquidityProvisionData }) => data.id || ''}
      tooltipShowDelay={500}
      defaultColDef={defaultColDef}
      {...props}
      columnDefs={colDefs}
    />
  );
};

export default LiquidityTable;
