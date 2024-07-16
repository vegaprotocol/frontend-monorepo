import BigNumber from 'bignumber.js';
import * as utils from './utils';
import { useForm } from './use-form';

export const useNotionalSizeFlip = () => {
  const form = useForm();

  return (price?: BigNumber) => {
    if (!price || price.isZero()) {
      throw new Error(`cannot switch mode with price of ${price?.toString()}`);
    }

    const values = form.getValues();

    if (
      values.ticketType === 'stopLimit' ||
      values.ticketType === 'stopMarket'
    ) {
      throw new Error(
        `cannot switch sizeMode for ticket type: ${values.ticketType}`
      );
    }

    if (values.sizeMode === 'contracts') {
      const val = utils.toNotional(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toNumber());
      form.setValue('sizeMode', 'notional');
    } else if (values.sizeMode === 'notional') {
      const val = utils.toSize(BigNumber(values.size || '0'), price);
      form.setValue('size', val.toNumber());
      form.setValue('sizeMode', 'contracts');
    }
  };
};
