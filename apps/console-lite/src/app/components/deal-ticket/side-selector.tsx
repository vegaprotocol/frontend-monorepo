import React from 'react';
import classNames from 'classnames';
import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Side } from '@vegaprotocol/types';

interface SideSelectorProps {
  value: Side;
  onSelect: (side: Side) => void;
}

export const SIDE_NAMES: Record<Side, string> = {
  [Side.SIDE_BUY]: t('Long'),
  [Side.SIDE_SELL]: t('Short'),
};

export default ({ value, onSelect }: SideSelectorProps) => {
  return (
    <FormGroup
      label={t('Direction')}
      labelFor="order-side-toggle"
      hideLabel={true}
    >
      <fieldset
        className="w-full grid md:grid-cols-2 gap-4"
        id="order-side-toggle"
      >
        <button
          aria-label={t('Open long position')}
          type="button"
          className={classNames(
            'px-8 py-2',
            'buyButton hover:buyButton dark:buyButtonDark dark:hover:buyButtonDark',
            { selected: value === Side.SIDE_BUY }
          )}
          onClick={() => onSelect(Side.SIDE_BUY)}
        >
          {t('Long')}
        </button>
        <button
          aria-label={t('Open short position')}
          type="button"
          className={classNames(
            'px-8 py-2',
            'sellButton hover:sellButton dark:sellButtonDark dark:hover:sellButtonDark',
            { selected: value === Side.SIDE_SELL }
          )}
          onClick={() => onSelect(Side.SIDE_SELL)}
        >
          {t('Short')}
        </button>
        <div className="md:col-span-2 text-black dark:text-white text-ui-small">
          {t(
            'Trading derivatives allows you to make a profit or loss regardless of whether the market you are trading goes up or down. If you open a "long" position, you will make a profit if the price of your chosen market goes up, and you will make a profit for "short" positions when the price goes down.'
          )}
        </div>
      </fieldset>
    </FormGroup>
  );
};
