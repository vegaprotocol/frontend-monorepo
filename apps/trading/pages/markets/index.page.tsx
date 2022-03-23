import { useState, useEffect, useRef } from 'react';
import { produce } from 'immer';
import assign from 'assign-deep';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import { AsyncRenderer } from '../../components/async-renderer';
import { MarketListTable, getRowNodeId } from '@vegaprotocol/market-list';
import {
  Markets_markets,
  Markets_markets_data
} from '@vegaprotocol/graphql';

import { subscribe } from '../../data-providers/markets-data-provider';
import type { CallbackArg } from '../../data-providers/markets-data-provider';
import type { AgGridReact } from 'ag-grid-react';

const Markets = () => {
  const { pathname, push } = useRouter();
  const [markets, setMarkets] = useState<Markets_markets[]>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>(undefined);
  const client = useApolloClient();
  const gridRef = useRef<AgGridReact>();
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    return subscribe(client, ({ data, error, loading, delta }: CallbackArg) => {
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
          if (!gridRef.current) return;
          const rowNode = gridRef.current.api.getRowNode(
            getRowNodeId(delta.market)
          );

          if (rowNode) {
            const updatedData = produce(
              rowNode.data.data,
              (draft: Markets_markets_data) => assign(draft, delta)
            );
            if (updatedData !== rowNode.data.data) {
              update.push({ ...rowNode.data, data: delta });
            }
          } /* else {
            add.push(d);
          }*/
          // async transaction for optimal handling of high grequency updates
          if (update.length || add.length) {
            gridRef.current.api.applyTransactionAsync({
              update,
              add,
              addIndex: 0,
            });
          }
        }
      }
    });
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

// const TwoMarkets = () => (<><div style={{height: '50%'}}><Markets /></div><div style={{height: '50%'}}><Markets /></div></>)

// export default TwoMarkets;
