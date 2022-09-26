import { useOutletContext } from 'react-router-dom';
import { t } from '@vegaprotocol/react-helpers';
import { usePositionsAssets } from '@vegaprotocol/positions';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import PositionsAsset from './positions-asset';

const Positions = () => {
  const { partyId } = useOutletContext<{ partyId: string }>();
  const { data, error, loading, assetSymbols } = usePositionsAssets({
    partyId,
  });
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {assetSymbols && assetSymbols.length > 0 && (
        <div className="w-full, h-max">
          {assetSymbols?.map((assetSymbol) => (
            <PositionsAsset
              key={assetSymbol}
              partyId={partyId}
              assetSymbol={assetSymbol}
            />
          ))}
        </div>
      )}
      {assetSymbols?.length === 0 && <Splash>{t('No data to display')}</Splash>}
    </AsyncRenderer>
  );
};

export default Positions;
