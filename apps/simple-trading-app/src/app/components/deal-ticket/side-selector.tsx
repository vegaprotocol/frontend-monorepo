import React from 'react';
import classNames from 'classnames';
import { FormGroup, Button } from '@vegaprotocol/ui-toolkit';
import { Side as OrderSide } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/react-helpers';

interface SideSelectorProps {
  value: OrderSide;
  onSelect: (side: OrderSide) => void;
}

export const SIDE_NAMES: Record<OrderSide, string> = {
  [OrderSide.SIDE_BUY]: t('Long'),
  [OrderSide.SIDE_SELL]: t('Short'),
};

export default ({ value, onSelect }: SideSelectorProps) => {
  return (
    <FormGroup
      label={t('Direction')}
      labelFor="order-side-toggle"
      labelClassName="sr-only"
    >
      <fieldset
        className="w-full grid md:grid-cols-2 gap-20"
        id="order-side-toggle"
      >
        <Button
          variant="inline-link"
          aria-label={t('Open long position')}
          className={classNames(
            'py-8',
            'buyButton hover:buyButton dark:buyButtonDark dark:hover:buyButtonDark',
            { selected: value === OrderSide.SIDE_BUY }
          )}
          onClick={() => onSelect(OrderSide.SIDE_BUY)}
        >
          {t('Long')}
        </Button>
        <Button
          variant="inline-link"
          aria-label={t('Open short position')}
          className={classNames(
            'py-8',
            'sellButton hover:sellButton dark:sellButtonDark dark:hover:sellButtonDark',
            { selected: value === OrderSide.SIDE_SELL }
          )}
          onClick={() => onSelect(OrderSide.SIDE_SELL)}
        >
          {t('Short')}
        </Button>
        <div className="md:col-span-2 text-black dark:text-white text-ui-small">
          {t(
            'Trading derivatives allows you to make a profit or loss regardless of whether the market you are trading goes up or down. If you open a "long" position, you will make a profit if the price of your chosen market goes up, and you will make a profit for "short" positions when the price goes down.'
          )}
        </div>
      </fieldset>
    </FormGroup>
  );
};
