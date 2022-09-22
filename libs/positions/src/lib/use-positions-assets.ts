import { useCallback, useMemo, useRef } from 'react';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { Position } from './positions-data-providers';
import { positionsMetricsDataProvider as dataProvider } from './positions-data-providers';

interface Props {
  partyId: string;
}

const getSymbols = (positions: Position[]) =>
  Array.from(new Set(positions.map((position) => position.assetSymbol))).sort();

export const usePositionsAssets = ({ partyId }: Props) => {
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const assetSymbols = useRef<string[] | undefined>();
  const update = useCallback(({ data }: { data: Position[] | null }) => {
    if (data?.length) {
      const newAssetSymbols = getSymbols(data);
      if (
        !newAssetSymbols.every(
          (symbol) =>
            assetSymbols.current && assetSymbols.current.includes(symbol)
        )
      ) {
        assetSymbols.current = newAssetSymbols;
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
  if (!assetSymbols.current && data) {
    assetSymbols.current = getSymbols(data);
  }
  return { data, error, loading, assetSymbols: assetSymbols.current };
};
