import * as SliderPrimitive from '@radix-ui/react-slider';
import type { SliderProps } from '@radix-ui/react-slider';
import classNames from 'classnames';
import { SliderThumb } from './slider';
import BigNumber from 'bignumber.js';

export const PercentageSlider = (
  props: Omit<SliderProps, 'min' | 'max'> &
    Required<Pick<SliderProps, 'max' | 'min'>>
) => {
  const markers = [0, 25, 50, 75, 100];
  const value = props.value?.[0] || props.defaultValue?.[0];
  const percentageValue =
    value !== undefined
      ? `${(((value - props.min) / (props.max - props.min)) * 100).toFixed(1)}%`
      : undefined;
  return (
    <div className="relative">
      <SliderPrimitive.Root
        {...props}
        className="relative flex items-center select-none touch-none h-10 pb-5 w-full"
      >
        <SliderPrimitive.Track className=" relative grow h-[4px]">
          <span className="bg-vega-clight-700 dark:bg-vega-cdark-700 absolute left-2 right-2 top-0 bottom-0"></span>
          <SliderPrimitive.Range className="absolute h-full">
            <span className="absolute left-2 right-0 h-full bg-vega-clight-100 dark:bg-vega-cdark-100"></span>
          </SliderPrimitive.Range>
          <span className="absolute top-[-3px] left-[8px] right-[8px]">
            {markers.map((v, i) => {
              const left = `${v}%`;
              const valueToSet =
                props.min + ((props.max - props.min) * v) / 100;
              const lowerThanValue = value && valueToSet < value;
              return (
                <span
                  key={left}
                  className={classNames(
                    'absolute translate-x-[-50%] block w-[10px] h-[10px] rounded-full',
                    {
                      'bg-vega-clight-500 dark:bg-vega-cdark-500':
                        !lowerThanValue,
                      'bg-vega-clight-50 dark:bg-vega-cdark-50':
                        !!lowerThanValue,
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
              onClick={
                props.onValueChange
                  ? (event) => {
                      if (!props.onValueChange) {
                        return;
                      }
                      let valueToSet = BigNumber(props.min).plus(
                        BigNumber(props.max)
                          .minus(props.min)
                          .multipliedBy(v)
                          .dividedBy(100)
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
              className="absolute translate-x-[-50%] text-xs font-alpha mt-1 text-vega-clight-100 dark:text-vega-cdark-100"
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
