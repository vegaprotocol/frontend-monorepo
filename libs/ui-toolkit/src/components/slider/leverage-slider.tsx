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
        <span className="bg-vega-clight-700 dark:bg-vega-cdark-700 absolute left-2 right-2 top-0 bottom-0"></span>
        <SliderPrimitive.Range className="absolute h-full">
          <span className="absolute left-2 right-0 h-full bg-vega-clight-100 dark:bg-vega-cdark-100"></span>
        </SliderPrimitive.Range>
        <span className="block absolute top-[-3px] left-[8px] right-[8px]">
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
                        'block w-[10px] h-[10px] rounded-full',
                        {
                          'bg-vega-clight-500 dark:bg-vega-cdark-500':
                            higherThanValue,
                          'bg-vega-clight-50 dark:bg-vega-cdark-50':
                            !higherThanValue,
                        }
                      )}
                    ></span>
                    <span className="text-xs font-alpha mt-1 text-vega-clight-100 dark:text-vega-cdark-100 ">
                      {labelValue}x
                    </span>
                  </span>
                );
              })}
        </span>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-[18px] h-[18px] border-[2px] rounded-full border-white dark:border-vega-cdark-900 bg-vega-clight-50 dark:bg-vega-cdark-50 focus-visible:outline-0" />
    </SliderPrimitive.Root>
  );
};
