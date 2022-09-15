import { useCallback, useMemo, useRef } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';
import type { Position } from './positions-data-providers';
import { Positions } from './positions';
import { useClosePosition } from '../';

interface PositionsManagerProps {
  partyId: string;
}

const getSymbols = (positions: Position[]) =>
  Array.from(new Set(positions.map((position) => position.assetSymbol))).sort();

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const assetSymbols = useRef<string[] | undefined>();
  const { submit, Dialog } = useClosePosition();
  const onClose = useCallback(
    (position: Position) => {
      submit(position);
    },
    [submit]
  );
  const update = useCallback(({ data }: { data: Position[] | null }) => {
    if (data?.length) {
      const newAssetSymbols = getSymbols(data);
      if (
        !newAssetSymbols.every(
          (symbol) =>
            assetSymbols.current && assetSymbols.current.includes(symbol)
        )
      ) {
        return false;
      }
    }
    return true;
  }, []);
  const { data, error, loading } = useDataProvider<Position[], never>({
    dataProvider,
    update,
    variables,
  });
  return (
    <>
      <AsyncRenderer loading={loading} error={error} data={assetSymbols}>
        {data &&
          getSymbols(data)?.map((assetSymbol) => (
            <Positions
              partyId={partyId}
              assetSymbol={assetSymbol}
              key={assetSymbol}
              onClose={onClose}
            />
          ))}
      </AsyncRenderer>

      <Dialog>
        <p>Your position was not closed! This is still not implemented.</p>
      </Dialog>
    </>
  );
};
