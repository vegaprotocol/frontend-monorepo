import type { ProposalListFieldsFragment } from '@vegaprotocol/governance';
import { VoteProgress } from '@vegaprotocol/governance';
import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/ui-toolkit';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { RowClickedEvent } from 'ag-grid-community';
import {
  getDateTimeFormat,
  NetworkParams,
  t,
  useNetworkParams,
} from '@vegaprotocol/react-helpers';
import { ProposalStateMapping } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { BREAKPOINT_MD } from '../../config/breakpoints';
import { JsonViewerDialog } from '../dialogs/json-viewer-dialog';

type ProposalTermsDialog = {
  open: boolean;
  title: string;
  content: unknown;
};
type ProposalsTableProps = {
  data: ProposalListFieldsFragment[] | null;
};
export const ProposalsTable = ({ data }: ProposalsTableProps) => {
  const { params } = useNetworkParams([
    NetworkParams.governance_proposal_market_requiredMajority,
  ]);
  const tokenLink = useLinks(DApp.Token);
  const requiredMajorityPercentage = useMemo(() => {
    const requiredMajority =
      params?.governance_proposal_market_requiredMajority ?? 1;
    return new BigNumber(requiredMajority).times(100);
  }, [params?.governance_proposal_market_requiredMajority]);

  const gridRef = useRef<AgGridReact>(null);
  useLayoutEffect(() => {
    const showColumnsOnDesktop = () => {
      gridRef.current?.columnApi.setColumnsVisible(
        ['voting', 'cDate', 'eDate', 'type'],
        window.innerWidth > BREAKPOINT_MD
      );
      gridRef.current?.columnApi.setColumnWidth(
        'actions',
        window.innerWidth > BREAKPOINT_MD ? 221 : 80
      );
    };
    window.addEventListener('resize', showColumnsOnDesktop);
    return () => {
      window.removeEventListener('resize', showColumnsOnDesktop);
    };
  }, []);

  const [dialog, setDialog] = useState<ProposalTermsDialog>({
    open: false,
    title: '',
    content: null,
  });

  return (
    <>
      <AgGrid
        ref={gridRef}
        rowData={data}
        getRowId={({ data }: { data: ProposalListFieldsFragment }) =>
          data.id || data.rationale.title
        }
        overlayNoRowsTemplate={t('This chain has no markets')}
        domLayout="autoHeight"
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
          filter: true,
          filterParams: { buttons: ['reset'] },
          autoHeight: true,
        }}
        suppressCellFocus={true}
        onRowClicked={({ data, event }: RowClickedEvent) => {
          if (
            (event?.target as HTMLElement).tagName.toUpperCase() !== 'BUTTON'
          ) {
            const proposalPage = tokenLink(
              TOKEN_PROPOSAL.replace(':id', data.id)
            );
            window.open(proposalPage, '_blank');
          }
        }}
      >
        <AgGridColumn
          colId="title"
          headerName={t('Title')}
          field="rationale.title"
          flex={2}
          wrapText={true}
        />
        <AgGridColumn
          colId="type"
          maxWidth={180}
          hide={window.innerWidth <= BREAKPOINT_MD}
          headerName={t('Type')}
          field="terms.change.__typename"
        />
        <AgGridColumn
          maxWidth={100}
          headerName={t('State')}
          field="state"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<ProposalListFieldsFragment, 'state'>) => {
            return value ? ProposalStateMapping[value] : '-';
          }}
        />
        <AgGridColumn
          colId="voting"
          maxWidth={100}
          hide={window.innerWidth <= BREAKPOINT_MD}
          headerName={t('Voting')}
          cellRenderer={({
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
                <div className="uppercase flex h-full items-center justify-center pt-2">
                  <VoteProgress
                    threshold={requiredMajorityPercentage}
                    progress={yesPercentage}
                  />
                </div>
              );
            }
            return '-';
          }}
        />
        <AgGridColumn
          colId="cDate"
          maxWidth={150}
          hide={window.innerWidth <= BREAKPOINT_MD}
          headerName={t('Closing date')}
          field="terms.closingDatetime"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<
            ProposalListFieldsFragment,
            'terms.closingDatetime'
          >) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
          }}
        />
        <AgGridColumn
          colId="eDate"
          maxWidth={150}
          hide={window.innerWidth <= BREAKPOINT_MD}
          headerName={t('Enactment date')}
          field="terms.enactmentDatetime"
          valueFormatter={({
            value,
          }: VegaValueFormatterParams<
            ProposalListFieldsFragment,
            'terms.enactmentDatetime'
          >) => {
            return value ? getDateTimeFormat().format(new Date(value)) : '-';
          }}
        />
        <AgGridColumn
          colId="actions"
          minWidth={window.innerWidth > BREAKPOINT_MD ? 221 : 80}
          maxWidth={221}
          sortable={false}
          filter={false}
          resizable={false}
          cellRenderer={({
            data,
          }: VegaICellRendererParams<ProposalListFieldsFragment>) => {
            const proposalPage = tokenLink(
              TOKEN_PROPOSAL.replace(':id', data?.id || '')
            );
            const openDialog = () => {
              if (!data) return;
              setDialog({
                open: true,
                title: data.rationale.title,
                content: data.terms,
              });
            };
            return (
              <div className="pb-1">
                <button
                  className="underline max-md:hidden"
                  onClick={openDialog}
                >
                  {t('View terms')}
                </button>{' '}
                <ExternalLink className="max-md:hidden" href={proposalPage}>
                  {t('Open in Governance')}
                </ExternalLink>
                <ExternalLink className="md:hidden" href={proposalPage}>
                  {t('Open')}
                </ExternalLink>
              </div>
            );
          }}
        />
      </AgGrid>
      <JsonViewerDialog
        open={dialog.open}
        onChange={(isOpen) => setDialog({ ...dialog, open: isOpen })}
        title={dialog.title}
        content={dialog.content}
      />
    </>
  );
};
