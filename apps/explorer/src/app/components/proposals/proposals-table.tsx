import type {
  BatchproposalListFieldsFragment,
  ProposalListFieldsFragment,
} from '@vegaprotocol/proposals';
import { type AgGridReact } from 'ag-grid-react';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { AgGrid } from '@vegaprotocol/datagrid';
import {
  type VegaICellRendererParams,
  type VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { type ColDef } from 'ag-grid-community';
import type { RowClickedEvent } from 'ag-grid-community';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { ProposalStateMapping } from '@vegaprotocol/types';
import { DApp, TOKEN_PROPOSAL, useLinks } from '@vegaprotocol/environment';
import { BREAKPOINT_MD } from '../../config/breakpoints';
import { JsonViewerDialog } from '../dialogs/json-viewer-dialog';

type ProposalTermsDialog = {
  open: boolean;
  title: string;
  content: unknown;
};
type ProposalsTableProps = {
  data: Array<
    ProposalListFieldsFragment | BatchproposalListFieldsFragment
  > | null;
};
export const ProposalsTable = ({ data }: ProposalsTableProps) => {
  const tokenLink = useLinks(DApp.Governance);

  const gridRef = useRef<AgGridReact>(null);
  useLayoutEffect(() => {
    const showColumnsOnDesktop = () => {
      gridRef.current?.api.setColumnsVisible(
        ['voting', 'cDate', 'eDate', 'type'],
        window.innerWidth > BREAKPOINT_MD
      );
      gridRef.current?.api.setColumnWidth(
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
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        colId: 'title',
        headerName: t('Title'),
        field: 'rationale.title',
        flex: 2,
        wrapText: true,
      },
      {
        colId: 'type',
        maxWidth: 180,
        hide: window.innerWidth <= BREAKPOINT_MD,
        headerName: t('Type'),
        field: 'terms.change.__typename',
        valueGetter: ({ data }) => {
          return data?.terms?.change?.__typename || t('Batch');
        },
      },
      {
        maxWidth: 100,
        headerName: t('State'),
        field: 'state',
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<ProposalListFieldsFragment, 'state'>) => {
          return value ? ProposalStateMapping[value] : '-';
        },
      },
      {
        colId: 'cDate',
        maxWidth: 150,
        hide: window.innerWidth <= BREAKPOINT_MD,
        headerName: t('Closing date'),
        valueGetter: ({ data }) => {
          return (
            data?.terms?.closingDatetime || data.batchTerms.closingDatetime
          );
        },
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<
          ProposalListFieldsFragment,
          'terms.closingDatetime'
        >) => {
          return value ? getDateTimeFormat().format(new Date(value)) : '-';
        },
      },
      {
        colId: 'actions',
        minWidth: window.innerWidth > BREAKPOINT_MD ? 221 : 80,
        maxWidth: 221,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: ({
          data,
        }: VegaICellRendererParams<
          ProposalListFieldsFragment | BatchproposalListFieldsFragment
        >) => {
          const proposalPage = tokenLink(
            TOKEN_PROPOSAL.replace(':id', data?.id || '')
          );
          const openDialog = () => {
            if (!data) return;
            setDialog({
              open: true,
              title: data.rationale.title,
              content: 'terms' in data ? data.terms : data.subProposals,
            });
          };
          return (
            <div className="pb-1">
              <button
                className="underline underline-offset-4 max-md:hidden"
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
        },
      },
    ],
    [tokenLink]
  );
  return (
    <>
      <AgGrid
        ref={gridRef}
        rowData={data}
        getRowId={({
          data,
        }: {
          data: ProposalListFieldsFragment | BatchproposalListFieldsFragment;
        }) => data.id || data?.rationale?.title}
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
        columnDefs={columnDefs}
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
      />
      <JsonViewerDialog
        open={dialog.open}
        onChange={(isOpen) => setDialog({ ...dialog, open: isOpen })}
        title={dialog.title}
        content={dialog.content}
      />
    </>
  );
};
