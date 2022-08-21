import { useCallback, useMemo, useState } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';
import type { Position } from './positions-data-providers';
import { Positions } from './positions';

interface PositionsManagerProps {
  partyId: string;
}

const getSymbols = (positions: Position[]) =>
  Array.from(new Set(positions.map((position) => position.assetSymbol))).sort();

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const [assetSymbols, setAssetSymbols] = useState<string[] | undefined>();
  const update = useCallback(
    ({ data }: { data: Position[] | null }) => {
      if (assetSymbols && data?.length) {
        const newAssetSymbols = getSymbols(data);
        if (!newAssetSymbols.every((symbol) => assetSymbols.includes(symbol))) {
          setAssetSymbols(newAssetSymbols);
        }
      }
      return true;
    },
    [assetSymbols]
  );
  const { data, error, loading } = useDataProvider<Position[], never>({
    dataProvider,
    update,
    variables,
  });
  setAssetSymbols(data?.length ? getSymbols(data) : undefined);
  return (
    <AsyncRenderer loading={loading} error={error} data={assetSymbols}>
      {assetSymbols?.map((assetSymbol) => (
        <Positions
          partyId={partyId}
          assetSymbol={assetSymbol}
          key={assetSymbol}
        />
      ))}
    </AsyncRenderer>
  );
};
