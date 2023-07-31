import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import type { ColDef } from 'ag-grid-community';
import {
  CenteredGridCellWrapper,
  COL_DEFS,
  DateRangeFilter,
  SetFilter,
} from '@vegaprotocol/datagrid';
import compact from 'lodash/compact';
import { useEnvironment, FLAGS } from '@vegaprotocol/environment';
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
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ProposalStateMapping } from '@vegaprotocol/types';
import type { ProposalListFieldsFragment } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { VoteProgress } from '../voting-progress';
import { ProposalActionsDropdown } from '../proposal-actions-dropdown';

export const useColumnDefs = () => {
  const { VEGA_TOKEN_URL } = useEnvironment();
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
        minWidth: 150,
        cellStyle: { lineHeight: '14px' },
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<
          ProposalListFieldsFragment,
          'terms.change.instrument.code'
        >) => {
          const { change } = data?.terms || {};
          if (change?.__typename === 'NewMarket' && VEGA_TOKEN_URL) {
            if (data?.id) {
              const link = `${VEGA_TOKEN_URL}/proposals/${data.id}`;
              return (
                <ExternalLink href={link}>
                  {change.instrument.code}
                </ExternalLink>
              );
            }
            return change.instrument.code;
          }
          return null;
        },
      },
      {
        colId: 'description',
        headerName: t('Description'),
        field: 'terms.change.instrument.name',
      },
      {
        colId: 'asset',
        headerName: t('Settlement asset'),
        field: 'terms.change.instrument.futureProduct.settlementAsset.name',
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
      FLAGS.SUCCESSOR_MARKETS && {
        headerName: t('Parent market'),
        field: 'id',
        colId: 'parentMarket',
        cellRenderer: 'SuccessorMarketRenderer',
        cellRendererParams: { parent: true },
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
        flex: 1,
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
        flex: 1,
      },
    ]);
  }, [VEGA_TOKEN_URL, requiredMajorityPercentage]);

  const defaultColDef: ColDef = useMemo(() => {
    return {
      sortable: true,
      resizable: true,
      filter: true,
      filterParams: { buttons: ['reset'] },
      minWidth: 100,
    };
  }, []);

  return useMemo(
    () => ({
      columnDefs,
      defaultColDef,
    }),
    [columnDefs, defaultColDef]
  );
};
