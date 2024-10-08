import * as SliderPrimitive from '@radix-ui/react-slider';
import type { SliderProps } from '@radix-ui/react-slider';
import { cn } from '../../utils/cn';
import { SliderThumb } from './slider';

export const LeverageSlider = (
  props: Omit<SliderProps, 'min' | 'max'> &
    Required<Pick<SliderProps, 'max' | 'min'>>
) => {
  const step = [0.1, 0.2, 0.5, 2, 5, 10, 20, 25, 50, 100].find(
    (step) => props.max / step <= 6
  );
  const value = props.value?.[0] || props.defaultValue?.[0];
  return (
    <div className="relative">
      <SliderPrimitive.Root
        {...props}
        className="relative flex items-center select-none touch-none h-10 pb-5 w-full"
      >
        <SliderPrimitive.Track className="relative grow h-[4px] bg-surface-2">
          <SliderPrimitive.Range className="absolute h-full bg-gs-500" />
          <span className="absolute top-[-3px] left-[8px] right-[8px]">
            {step &&
              new Array(Math.floor(props.max / step) + 1)
                .fill(null)
                .map((v, i) => {
                  const labelValue = step * i || 1;
                  const lowerThanValue = value && labelValue < value;
                  if (labelValue > props.max) {
                    return null;
                  }
                  const left = `${
                    ((labelValue - props.min) / (props.max - props.min)) * 100
                  }%`;
                  return (
                    <span
                      key={left}
                      className={cn(
                        'absolute translate-x-[-50%] block w-[10px] h-[10px] rounded-full',
                        {
                          'bg-surface-3 ': !lowerThanValue,
                          'bg-gs-500': !!lowerThanValue,
                        }
                      )}
                      style={{
                        left,
                      }}
                    />
                  );
                })}
          </span>
        </SliderPrimitive.Track>
        <SliderThumb />
      </SliderPrimitive.Root>
      <span className="block absolute top-[15px] left-[8px] right-[8px]">
        {step &&
          new Array(Math.floor(props.max / step) + 1).fill(null).map((v, i) => {
            const labelValue = step * i || 1;
            if (labelValue > props.max) {
              return null;
            }
            const left = `${
              ((labelValue - props.min) / (props.max - props.min)) * 100
            }%`;
            return (
              <button
                type="button"
                onClick={() =>
                  props.onValueChange && props.onValueChange([labelValue])
                }
                key={labelValue}
                className="absolute translate-x-[-50%] text-xs mt-1 text-surface-1-fg "
                style={{
                  left,
                }}
              >
                {labelValue.toFixed(labelValue < 1 ? 1 : 0)}x
              </button>
            );
          })}
      </span>
    </div>
  );
};
