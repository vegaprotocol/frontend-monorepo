import { t } from '@vegaprotocol/react-helpers';
import { usePositionsAssets } from '@vegaprotocol/positions';
import { AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import PositionsAsset from './positions-asset';

interface Props {
  partyId: string;
}

const Positions = ({ partyId }: Props) => {
  const { data, error, loading, assetSymbols } = usePositionsAssets({
    partyId,
  });
  console.log('data', data);
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <div className="w-full h-max">
        {assetSymbols?.map((assetSymbol) => (
          <PositionsAsset
            key={assetSymbol}
            partyId={partyId}
            assetSymbol={assetSymbol}
          />
        ))}
      </div>
      {assetSymbols?.length === 0 && <Splash>{t('No data to display')}</Splash>}
    </AsyncRenderer>
  );
};

export default Positions;
