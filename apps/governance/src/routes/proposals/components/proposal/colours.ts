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
    'bg-vega-yellow-400 after:bg-vega-yellow-400':
      'yellow' === getColour(indicator, max),
    'bg-vega-green-400 after:bg-vega-green-400':
      'green' === getColour(indicator, max),
    'bg-vega-blue-400 after:bg-vega-blue-400':
      'blue' === getColour(indicator, max),
    'bg-vega-purple-400 after:bg-vega-purple-400':
      'purple' === getColour(indicator, max),
    'bg-vega-pink-400 after:bg-vega-pink-400':
      'pink' === getColour(indicator, max),
    'bg-vega-orange-400 after:bg-vega-orange-400':
      'orange' === getColour(indicator, max),
    'bg-vega-red-400 after:bg-vega-red-400':
      'red' === getColour(indicator, max),
    'bg-vega-clight-600 after:bg-vega-clight-600':
      'none' === getColour(indicator, max),
  });

export const getIndicatorStyle = (indicator: number) =>
  classNames(
    'rounded-sm text-black inline-block px-1 py-1 font-alpha calt h-8 w-7 text-center',
    'text-border-1',
    getStyle(indicator),
    // Comment below if you want to remove the "chevron"
    'relative mr-[11px]',
    'after:absolute after:z-[-1] after:top-1 after:right-[-11px] after:rounded-sm',
    "after:w-[22.62px] after:h-[22.62px] after:rotate-45 after:content-['']"
  );
