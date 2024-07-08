import * as SliderPrimitives from '@radix-ui/react-slider';
import classNames from 'classnames';
import { type ComponentProps } from 'react';

export const Slider = (props: ComponentProps<typeof SliderPrimitives.Root>) => {
  return (
    <SliderPrimitives.Root
      {...props}
      className={classNames(
        'relative flex items-center select-none touch-none w-full height-10',
        {
          'opacity-50': props.disabled,
        }
      )}
    >
      <SliderPrimitives.Track className="relative h-1 bg-black flex-1 rounded" />
      <SliderPrimitives.Thumb className="block w-4 h-4 bg-vega-blue rounded-full" />
    </SliderPrimitives.Root>
  );
};
