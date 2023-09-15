import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import type { ColDef } from 'ag-grid-community';
import {
  CenteredGridCellWrapper,
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
  ProductTypeMapping,
  ProductTypeShortName,
  ProposalStateMapping,
} from '@vegaprotocol/types';
import type { ProposalListFieldsFragment } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { VoteProgress } from '../voting-progress';
import { ProposalActionsDropdown } from '../proposal-actions-dropdown';

export const useColumnDefs = () => {
  const { params } = useNetworkParams([
    NetworkParams.governance_proposal_market_requiredMajority,
  ]);
  const requiredMajorityPercentage = useMemo(() => {
    const requiredMajority =
      params?.governance_proposal_market_requiredMajority ?? 1;
    return new BigNumber(requiredMajority).times(100);
  }, [params?.governance_proposal_market_requiredMajority]);

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

          // TODO: update when we switch to ProductConfiguration
          const productType = 'Future';
          return (
            <StackedCell
              primary={value}
              secondary={
                <span
                  title={ProductTypeMapping[productType]}
                  className="uppercase"
                >
                  {ProductTypeShortName[productType]}
                </span>
              }
            />
          );
        },
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        field: 'terms.change.instrument.futureProduct.settlementAsset.symbol',
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
        colId: 'voting',
        headerName: t('Voting'),
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<ProposalListFieldsFragment>) => {
          if (data) {
            const yesTokens = new BigNumber(data.votes.yes.totalTokens);
            const noTokens = new BigNumber(data.votes.no.totalTokens);
            const totalTokensVoted = yesTokens.plus(noTokens);
            const yesPercentage = totalTokensVoted.isZero()
              ? new BigNumber(0)
              : yesTokens.multipliedBy(100).dividedBy(totalTokensVoted);
            return (
              <CenteredGridCellWrapper>
                <VoteProgress
                  threshold={requiredMajorityPercentage}
                  progress={yesPercentage}
                />
              </CenteredGridCellWrapper>
            );
          }
          return '-';
        },
        filter: false,
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
  }, [requiredMajorityPercentage]);

  return columnDefs;
};
