import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type ButtonHTMLAttributes } from 'react';
import { useNotionalSizeFlip } from './use-notional-size-flip';

export const SizeModeButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const flip = useNotionalSizeFlip();
  return (
    <button
      className="flex justify-center items-center bg-gs-500  p-2 rounded"
      type="button"
      onClick={flip}
      {...props}
    >
      <VegaIcon name={VegaIconNames.TRANSFER} size={14} />
    </button>
  );
};
