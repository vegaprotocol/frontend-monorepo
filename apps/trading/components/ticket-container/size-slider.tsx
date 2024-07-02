import * as SliderPrimitives from '@radix-ui/react-slider';
import { useT } from '../../lib/use-t';
import { ComponentPropsWithoutRef } from 'react';
import { useFormContext } from 'react-hook-form';

export const SizeSlider = (
  props: ComponentPropsWithoutRef<typeof SliderPrimitives.Root>
) => {
  const t = useT();
  const form = useFormContext();

  return (
    <SliderPrimitives.Root
      {...props}
      min={0}
      max={100}
      defaultValue={[0]}
      onValueCommit={(value) => {
        // TODO: set size based on available margin
        form.setValue('size', value[0].toString(), { shouldValidate: true });
      }}
      className="relative flex items-center select-none touch-none w-full height-10"
    >
      <SliderPrimitives.Track className="relative h-1 bg-black flex-1 rounded" />
      <SliderPrimitives.Thumb
        className="block w-4 h-4 bg-vega-blue rounded-full"
        aria-label={t('Size')}
      />
    </SliderPrimitives.Root>
  );
};
