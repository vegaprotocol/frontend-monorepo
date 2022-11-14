import { useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/react-helpers';
import type { VegaICellRendererParams } from '@vegaprotocol/ui-toolkit';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import type { ProposalListFieldsFragment } from '../proposals-data-provider/__generated___/Proposals';

type NewMarket = {
  __typename?: 'NewMarket';
  instrument: {
    __typename?: 'InstrumentConfiguration';
    code: string;
    name: string;
    futureProduct?: {
      __typename?: 'FutureProduct';
      settlementAsset: {
        __typename?: 'Asset';
        id: string;
        name: string;
        symbol: string;
      };
    } | null;
  };
};

const instrumentGuard = (
  change?: ProposalListFieldsFragment['terms']['change']
): change is NewMarket => {
  return change?.__typename === 'NewMarket';
};

export const useColumnDefs = () => {
  const { VEGA_TOKEN_URL } = useEnvironment();
  const cellCss = 'grid h-full items-center';
  const columnDefs: ColDef[] = [
    {
      colId: 'market',
      headerName: t('Market'),
      field: 'terms.change.instrument.code',
      width: 100,
      cellRenderer: ({
        data,
      }: VegaICellRendererParams<ProposalListFieldsFragment>) => {
        const { change } = data?.terms || {};
        if (instrumentGuard(change)) {
          if (data?.id) {
            const link = `${VEGA_TOKEN_URL}/governance/${data.id}`;
            return (
              <ExternalLink href={link}>{change.instrument.code}</ExternalLink>
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
    },
    {
      colId: 'closing-date',
      headerName: t('Closing date'),
      field: 'terms.closingDatetime',
    },
    {
      colId: 'enactment-date',
      headerName: t('Enactment date'),
      field: 'terms.enactmentDatetime',
    },
  ];
  const defaultColDef: ColDef = useMemo(() => {
    return {
      sortable: false,
      unSortIcon: false,
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
