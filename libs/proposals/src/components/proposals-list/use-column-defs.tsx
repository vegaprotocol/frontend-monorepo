import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import type { ColDef } from 'ag-grid-community';
import {
  COL_DEFS,
  DateRangeFilter,
  SetFilter,
  StackedCell,
} from '@vegaprotocol/datagrid';
import compact from 'lodash/compact';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import {
  NetworkParams,
  useNetworkParams,
} from '@vegaprotocol/network-parameters';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import {
  ProposalProductTypeShortName,
  ProposalStateMapping,
} from '@vegaprotocol/types';
import type { ProposalListFieldsFragment } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { ProposalActionsDropdown } from '../proposal-actions-dropdown';

export const useColumnDefs = () => {
  const columnDefs: ColDef[] = useMemo(() => {
    return compact([
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'terms.change.instrument.code',
        cellStyle: { lineHeight: '14px' },
        cellRenderer: ({
          value,
          data,
        }: {
          value: string;
          data: ProposalListFieldsFragment;
        }) => {
          if (!value || !data) return '-';

          const getProductType = (data: ProposalListFieldsFragment) => {
            if (
              data.terms.__typename === 'ProposalTerms' &&
              data.terms.change.__typename === 'NewMarket'
            ) {
              return data.terms.change.instrument.product?.__typename;
            }
            return undefined;
          };

          const productType = getProductType(data);
          return (
            productType && (
              <StackedCell
                primary={value}
                secondary={
                  <span
                    title={ProposalProductTypeShortName[productType]}
                    className="uppercase"
                  >
                    {ProposalProductTypeShortName[productType]}
                  </span>
                }
              />
            )
          );
        },
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        field: 'terms.change.instrument.product.settlementAsset.symbol',
      },
      {
        colId: 'state',
        headerName: t('State'),
        field: 'state',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<ProposalListFieldsFragment, 'state'>) =>
          value ? ProposalStateMapping[value] : '-',
        filter: SetFilter,
        filterParams: {
          set: ProposalStateMapping,
        },
      },
      {
        headerName: t('Parent market'),
        field: 'terms.change.successorConfiguration.parentMarketId',
        cellRenderer: 'ParentMarketCell',
      },
      {
        colId: 'closing-date',
        headerName: t('Closing date'),
        field: 'terms.closingDatetime',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          ProposalListFieldsFragment,
          'terms.closingDatetime'
        >) => (value ? getDateTimeFormat().format(new Date(value)) : '-'),
        filter: DateRangeFilter,
      },
      {
        colId: 'enactment-date',
        headerName: t('Enactment date'),
        field: 'terms.enactmentDatetime',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          ProposalListFieldsFragment,
          'terms.enactmentDatetime'
        >) => (value ? getDateTimeFormat().format(new Date(value)) : '-'),
        filter: DateRangeFilter,
      },
      {
        colId: 'proposal-actions',
        ...COL_DEFS.actions,
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<ProposalListFieldsFragment>) => {
          if (!data?.id) return null;

          return <ProposalActionsDropdown id={data.id} />;
        },
      },
    ]);
  }, []);

  return columnDefs;
};
