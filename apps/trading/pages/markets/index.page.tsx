import { useState, useEffect, useRef } from 'react';
import { produce } from 'immer';
import merge from 'lodash/merge';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '../../components/async-renderer';
import { MarketListTable, getRowNodeId } from '@vegaprotocol/market-list';
import {
  Markets_markets,
  Markets_markets_data,
  MarketsDataProviderCallbackArg,
  marketsDataProvider,
} from '@vegaprotocol/graphql';

import type { AgGridReact } from 'ag-grid-react';

const Markets = () => {
  const { pathname, push } = useRouter();
  const [markets, setMarkets] = useState<Markets_markets[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();
  const client = useApolloClient();
  const gridRef = useRef<AgGridReact | null>(null);
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    return marketsDataProvider(
      client,
      ({ data, error, loading, delta }: MarketsDataProviderCallbackArg) => {
        setError(error);
        setLoading(loading);
        if (!error && !loading) {
          if (!initialized.current || !gridRef.current) {
            initialized.current = true;
            setMarkets(data);
          } else {
            const update: Markets_markets[] = [];
            const add: Markets_markets[] = [];

            // split into updates and adds
            if (!gridRef.current || !delta) return;

            const rowNode = gridRef.current.api.getRowNode(
              getRowNodeId(delta.market)
            );

            if (rowNode) {
              const updatedData = produce(
                rowNode.data.data,
                (draft: Markets_markets_data) => merge(draft, delta)
              );
              if (updatedData !== rowNode.data.data) {
                update.push({ ...rowNode.data, data: delta });
              }
            }
            // @TODO - else add new market
            if (update.length || add.length) {
              gridRef.current.api.applyTransactionAsync({
                update,
                add,
                addIndex: 0,
              });
            }
          }
        }
      }
    );
  }, [client, initialized]);

  return (
    <AsyncRenderer loading={loading} error={error} data={markets}>
      {(data) => (
        <MarketListTable
          ref={gridRef}
          markets={data}
          onRowClicked={(id) =>
            push(`${pathname}/${id}?portfolio=orders&trade=orderbook`)
          }
        />
      )}
    </AsyncRenderer>
  );
};

export default Markets;
