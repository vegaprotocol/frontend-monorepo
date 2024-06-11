import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { Side } from '@vegaprotocol/types';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';

type Market = {
  decimalPlaces: number;
  tradableInstrument: {
    instrument: {
      code: string;
    };
  };
};

export const SpotData = (props: {
  price: string;
  topAmount: string;
  bottomAmount: string;
  market?: Market;
  side?: Side;
  topAsset?: AssetFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
}) => {
  return (
    <dl className="text-left flex flex-col gap-1">
      <Conversion {...props} />
      <BestPrice {...props} />
    </dl>
  );
};

export const Conversion = ({
  topAmount,
  bottomAmount,
  topAsset,
  bottomAsset,
}: {
  topAmount: string;
  bottomAmount: string;
  topAsset?: AssetFieldsFragment;
  bottomAsset?: AssetFieldsFragment;
}) => {
  if (!topAsset || !bottomAsset) return null;
  if (!topAmount || !bottomAmount) return null;

  return (
    <div className="flex gap-1">
      <dt>
        {topAmount} {topAsset.symbol}
      </dt>
      <span>=</span>
      <dd>
        {bottomAmount} {bottomAsset.symbol}
      </dd>
    </div>
  );
};

export const BestPrice = ({
  price,
  market,
  side,
}: {
  price: string;
  market?: Market;
  side?: Side;
}) => {
  const t = useT();

  if (!market) return null;
  if (!side) return null;

  const sideLabel = side === Side.SIDE_BUY ? t('Best ask') : t('Best bid');
  const label = `${market.tradableInstrument.instrument.code} ${sideLabel}`;

  return (
    <div className="flex gap-1">
      <dt>{label}</dt>
      <span>=</span>
      <dd>{addDecimalsFormatNumber(price, market.decimalPlaces)}</dd>
    </div>
  );
};
