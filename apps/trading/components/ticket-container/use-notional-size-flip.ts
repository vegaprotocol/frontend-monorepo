import { useFormContext } from 'react-hook-form';
import BigNumber from 'bignumber.js';
import * as utils from './utils';

export const useNotionalSizeFlip = () => {
  const form = useFormContext();

  return (price?: BigNumber) => {
    if (!price || price.isZero()) {
      throw new Error(`cannot switch mode with price of ${price?.toString()}`);
    }

    const values = form.getValues();

    if (values.sizeMode === 'contracts') {
      const val = utils.toNotional(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toString());
      form.setValue('sizeMode', 'notional');
    } else if (values.sizeMode === 'notional') {
      const val = utils.toSize(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toString());
      form.setValue('sizeMode', 'contracts');
    }
  };
};
