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

    if (values.sizeMode === 'contracts') {
      const val = helpers.toNotional(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toString());
      form.setValue('sizeMode', 'notional');
    } else if (values.sizeMode === 'notional') {
      const val = helpers.toSize(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toString());
      form.setValue('sizeMode', 'contracts');
    }
  };
};
