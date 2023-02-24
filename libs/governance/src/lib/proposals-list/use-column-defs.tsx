import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import type { ColDef } from 'ag-grid-community';
import { useEnvironment } from '@vegaprotocol/environment';
import { t, getDateTimeFormat } from '@vegaprotocol/utils';
import { NetworkParams, useNetworkParams } from '@vegaprotocol/react-helpers';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { ProposalStateMapping } from '@vegaprotocol/types';
import type { ProposalListFieldsFragment } from '../proposals-data-provider/__generated__/Proposals';
import { VoteProgress } from '../voting-progress';

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

  const cellCss = 'grid h-full items-center';
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'market',
        headerName: t('Market'),
        field: 'terms.change.instrument.code',
        width: 150,
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
      },
      {
        colId: 'voting',
        headerName: t('Voting'),
        cellClass: 'flex justify-between leading-tight font-mono',
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
              <div className="uppercase flex h-full items-center justify-center">
                <VoteProgress
                  threshold={requiredMajorityPercentage}
                  progress={yesPercentage}
                />
              </div>
            );
          }
          return '-';
        },
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
      },
    ];
  }, [VEGA_TOKEN_URL, requiredMajorityPercentage]);
  const defaultColDef: ColDef = useMemo(() => {
    return {
      sortable: false,
      cellClass: cellCss,
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
