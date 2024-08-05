import * as SliderPrimitives from '@radix-ui/react-slider';
import classNames from 'classnames';
import { type ComponentProps } from 'react';

const markers = [0, 25, 50, 75, 100];

export const Slider = (props: ComponentProps<typeof SliderPrimitives.Root>) => {
  return (
    <div className="flex flex-col gap-0.5">
      <SliderPrimitives.Root
        {...props}
        className={classNames(
          'relative flex items-center select-none touch-none w-full height-10 py-1.5',
          {
            'opacity-50': props.disabled,
          }
        )}
      >
        <SliderPrimitives.Track className="relative flex justify-between h-1 flex-1 rounded bg-gs-700 ">
          <SliderPrimitives.Range className="absolute h-1 bg-gs-100 " />
          {markers.map((m) => {
            return (
              <button
                key={m}
                type="button"
                className={classNames('relative -top-1 w-3 h-3 rounded-full', {
                  'bg-gs-100 ':
                    props.value !== undefined && props.value[0] >= m,
                  'bg-gs-500 ': props.value === undefined || props.value[0] < m,
                })}
                disabled={props.disabled}
                onClick={() => {
                  props.onValueChange && props.onValueChange([m]);
                  props.onValueCommit && props.onValueCommit([m]);
                }}
              >
                <span className="sr-only">{m}%</span>
              </button>
            );
          })}
        </SliderPrimitives.Track>
        <SliderPrimitives.Thumb className="group cursor-pointer relative block w-5 h-5 border-2 bg-gs-100  rounded-full border-gs-900 ">
          <span className="group-active:block hidden absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 rounded">
            {props.value}
          </span>
        </SliderPrimitives.Thumb>
      </SliderPrimitives.Root>
      <div className="flex justify-between h-3">
        {markers.map((m, i) => {
          const isMiddle = i > 0 && i < markers.length - 1;
          return (
            <span key={m} className="w-3 relative">
              <button
                type="button"
                className={classNames('absolute text-xs text-muted', {
                  'left-1/2 -translate-x-1/2': isMiddle,
                  'left-0': i === 0,
                  'right-0': i === markers.length - 1,
                })}
                disabled={props.disabled}
                onClick={() => {
                  props.onValueChange && props.onValueChange([m]);
                  props.onValueCommit && props.onValueCommit([m]);
                }}
              >
                {m}%
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
};
