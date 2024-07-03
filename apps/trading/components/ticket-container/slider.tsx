import * as SliderPrimitives from '@radix-ui/react-slider';
import { type ComponentProps } from 'react';

export const Slider = (props: ComponentProps<typeof SliderPrimitives.Root>) => {
  return (
    <SliderPrimitives.Root
      {...props}
      className="relative flex items-center select-none touch-none w-full height-10"
    >
      <SliderPrimitives.Track className="relative h-1 bg-black flex-1 rounded" />
      <SliderPrimitives.Thumb className="block w-4 h-4 bg-vega-blue rounded-full" />
    </SliderPrimitives.Root>
  );
};
