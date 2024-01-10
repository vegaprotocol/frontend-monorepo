import * as SliderPrimitive from '@radix-ui/react-slider';
import type { SliderProps } from '@radix-ui/react-slider';
import classNames from 'classnames';

export const LeverageSlider = (
  props: Omit<SliderProps, 'min' | 'max'> & Required<Pick<SliderProps, 'max'>>
) => {
  const step = [2, 5, 10, 20, 25].find((step) => props.max / step <= 6);
  const min = 1;
  const value = props.value?.[0] || props.defaultValue?.[0];
  return (
    <SliderPrimitive.Root
      {...props}
      min={min}
      className="relative flex items-center select-none touch-none h-10 pb-5 w-full"
    >
      <SliderPrimitive.Track className=" relative grow h-[4px]">
        <span className="bg-vega-clight-500 dark:bg-vega-cdark-500 absolute left-2 right-2 top-0 bottom-0"></span>
        <span className="block absolute top-[-2px] left-[8px] right-[8px]">
          {step &&
            new Array(Math.floor(props.max / step) + 1)
              .fill(null)
              .map((v, i) => {
                const labelValue = step * i || 1;
                const higherThanValue = value && labelValue > value;
                return (
                  <span
                    className="absolute flex flex-col items-center translate-x-[-50%]"
                    style={{
                      left: `${
                        ((labelValue - min) / (props.max - min)) * 100
                      }%`,
                    }}
                  >
                    <span
                      className={classNames(
                        'block w-[8px] h-[8px] border-[4px] rotate-45',
                        {
                          'border-black dark:border-white bg-white dark:bg-white':
                            !higherThanValue,
                          'border-vega-clight-500 dark:border-vega-cdark-500 bg-vega-clight-500 dark:bg-vega-cdark-500':
                            higherThanValue,
                        }
                      )}
                    ></span>
                    <span className="text-sm mt-1">{labelValue}x</span>
                  </span>
                );
              })}
        </span>
        <SliderPrimitive.Range className="absolute h-full">
          <span className="absolute left-2 right-0 h-full bg-black dark:bg-white"></span>
        </SliderPrimitive.Range>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-[16px] h-[16px] border-[3px] border-black dark:border-white bg-white dark:bg-black rotate-45 focus-visible:outline-0" />
    </SliderPrimitive.Root>
  );
};
