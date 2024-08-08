import classNames from 'classnames';

// rainbow-ish order
const COLOURS = ['red', 'pink', 'orange', 'yellow', 'green', 'blue', 'purple'];

const getColour = (indicator: number, max = COLOURS.length) => {
  const available =
    max < COLOURS.length ? COLOURS.slice(COLOURS.length - max) : COLOURS;
  const tiers = Object.keys(available).length;
  let index = Math.abs(indicator - 1);
  if (indicator >= tiers) {
    index = index % tiers;
  }
  return available[index];
};

export const getStyle = (indicator: number, max = COLOURS.length) =>
  classNames({
    'bg-vega-yellow-400 before:bg-vega-yellow-400':
      'yellow' === getColour(indicator, max),
    'bg-vega-green-400 before:bg-vega-green-400':
      'green' === getColour(indicator, max),
    'bg-vega-blue-400 before:bg-vega-blue-400':
      'blue' === getColour(indicator, max),
    'bg-vega-purple-400 before:bg-vega-purple-400':
      'purple' === getColour(indicator, max),
    'bg-vega-pink-400 before:bg-vega-pink-400':
      'pink' === getColour(indicator, max),
    'bg-vega-orange-400 before:bg-vega-orange-400':
      'orange' === getColour(indicator, max),
    'bg-vega-red-400 before:bg-vega-red-400':
      'red' === getColour(indicator, max),
    'bg-gs-600 before:bg-gs-600': 'none' === getColour(indicator, max),
  });

export const getIndicatorStyle = (indicator: number) =>
  classNames(
    'rounded-sm text-black inline-block px-1 py-1 font-alpha calt h-8 w-7 text-center',
    'text-border-1',
    getStyle(indicator),
    // Comment below if you want to remove the "chevron"
    'relative mr-[11px] z-1',
    'before:absolute before:z-0 before:top-1 before:right-[-11px] before:rounded-sm',
    "before:w-[22.62px] before:h-[22.62px] before:rotate-45 before:content-['']"
  );
