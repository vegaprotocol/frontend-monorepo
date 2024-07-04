import { isFuture, type MarketFieldsFragment } from '@vegaprotocol/markets';
import { toBigNum } from '@vegaprotocol/utils';
import type BigNumber from 'bignumber.js';
import { KeyValue } from './key-value';
import { useT } from '../../use-t';

export const FutureCapInfo = (props: {
  market: MarketFieldsFragment;
  size: string;
  priceCap?: BigNumber;
}) => {
  const t = useT();
  const product = props.market.tradableInstrument.instrument.product;

  if (!isFuture(product)) {
    return null;
  }

  if (!product.cap) {
    return null;
  }

  if (!props.priceCap) {
    return null;
  }

  const potentialReturn = toBigNum(props.size, props.market.decimalPlaces)
    .times(props.priceCap)
    .toString();

  return (
    <div className="my-1">
      <KeyValue
        label={t('Potential return')}
        value={potentialReturn}
        formattedValue={potentialReturn}
      />
    </div>
  );
};
