import { useFormContext } from 'react-hook-form';
import BigNumber from 'bignumber.js';
import * as helpers from './helpers';

export const useNotionalSizeFlip = () => {
  const form = useFormContext();

  return (price?: BigNumber) => {
    if (!price || price.isZero()) {
      throw new Error(`cannot switch mode with price of ${price?.toString()}`);
    }

    const values = form.getValues();

    if (values.mode === 'size') {
      const val = helpers.toNotional(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toString());
      form.setValue('mode', 'notional');
    } else if (values.mode === 'notional') {
      const val = helpers.toSize(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toString());
      form.setValue('mode', 'size');
    }
  };
};
