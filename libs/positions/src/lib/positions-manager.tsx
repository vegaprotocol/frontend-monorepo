import { useCallback } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { Position } from './positions-data-providers';
import { Positions } from './positions';
import { useClosePosition, usePositionsAssets } from '../';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const { submit, Dialog } = useClosePosition();
  const onClose = useCallback(
    (position: Position) => {
      submit(position);
    },
    [submit]
  );

  const { data, error, loading, assetSymbols } = usePositionsAssets(partyId);
  return (
    <>
      <AsyncRenderer loading={loading} error={error} data={data}>
        {assetSymbols?.map((assetSymbol) => (
          <Positions
            partyId={partyId}
            assetSymbol={assetSymbol}
            key={assetSymbol}
            onClose={onClose}
          />
        ))}
      </AsyncRenderer>
      <Dialog>
        <p>Your position was not closed! This is still not implemented. </p>
      </Dialog>
    </>
  );
};
