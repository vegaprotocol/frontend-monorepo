import * as SliderPrimitive from '@radix-ui/react-slider';
import type { SliderProps } from '@radix-ui/react-slider';
import { cn } from '@vegaprotocol/ui-toolkit';
import { SliderThumb } from './slider';
import BigNumber from 'bignumber.js';

export const PercentageSlider = ({
  min,
  max,
  ...props
}: Omit<SliderProps, 'min' | 'max'> &
  Required<Pick<SliderProps, 'max' | 'min'>>) => {
  const markers = [0, 25, 50, 75, 100];
  const disabled = min === max;
  const value = disabled ? 0 : props.value?.[0] || props.defaultValue?.[0];
  const percentageValue =
    value !== undefined && !disabled
      ? `${(((value - min) / (max - min)) * 100).toFixed(1)}%`
      : undefined;

  return (
    <div className="relative pb-4">
      <SliderPrimitive.Root
        disabled={disabled}
        {...props}
        min={disabled ? 0 : min}
        max={disabled ? 1 : max}
        value={disabled ? [0] : props.value}
        className="relative flex items-center select-none touch-none h-4 w-full"
      >
        <SliderPrimitive.Track className=" relative grow h-[4px]">
          <span className="bg-gs-700  absolute left-2 right-2 top-0 bottom-0"></span>
          <SliderPrimitive.Range className="absolute h-full">
            <span className="absolute left-2 right-0 h-full bg-gs-100 "></span>
          </SliderPrimitive.Range>
          <span className="absolute top-[-3px] left-[8px] right-[8px]">
            {markers.map((v, i) => {
              const left = `${v}%`;
              const valueToSet = min + ((max - min) * v) / 100;
              const lowerThanValue = value && valueToSet < value;
              return (
                <span
                  key={left}
                  className={cn(
                    'absolute translate-x-[-50%] block w-[10px] h-[10px] rounded-full',
                    {
                      'bg-gs-500 ': !lowerThanValue,
                      'bg-gs-50': !!lowerThanValue,
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
        <SliderThumb tooltip={percentageValue} />
      </SliderPrimitive.Root>
      <span className="block absolute top-[15px] left-[8px] right-[8px]">
        {markers.map((v, i) => {
          const label = `${v}%`;
          return (
            <button
              type="button"
              key={label}
              disabled={disabled}
              onClick={
                props.onValueChange
                  ? (event) => {
                      if (!props.onValueChange) {
                        return;
                      }
                      let valueToSet = BigNumber(min).plus(
                        BigNumber(max).minus(min).multipliedBy(v).dividedBy(100)
                      );
                      if (props.step) {
                        valueToSet = valueToSet.minus(
                          valueToSet.mod(props.step)
                        );
                      }
                      props.onValueChange([valueToSet.toNumber()]);
                    }
                  : undefined
              }
              className="absolute translate-x-[-50%] text-xs font-alpha mt-1 text-gs-100 "
              style={{
                left: `${v}%`,
              }}
            >
              {label}
            </button>
          );
        })}
      </span>
    </div>
  );
};
