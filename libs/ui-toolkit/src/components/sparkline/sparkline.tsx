import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { area, line } from 'd3-shape';
import isEqual from 'lodash/isEqual';
import React from 'react';

function colorByChange(a: number, b: number) {
  if (a < b) {
    return 'stroke-market-green-600 dark:stroke-market-green';
  } else if (a > b) {
    return 'stroke-market-red dark:stroke-market-red';
  }
  return 'stroke-black/40 dark:stroke-white/40';
}

function shadedColor(a: number, b: number) {
  if (a < b) {
    return 'fill-market-green-600 dark:fill-market-green';
  } else if (a > b) {
    return 'fill-market-red-600 dark:fill-market-red';
  }
  return 'fill-black dark:fill-white';
}

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  points?: number;
  className?: string;
}

export const SparklineView = ({
  data,
  width = 60,
  height = 15,
  points = 24,
  className,
}: SparklineProps) => {
  // Get the extent for our y value
  const [min, max] = extent(data, (d) => d);

  if (typeof min !== 'number' || typeof max !== 'number') {
    return null;
  }

  const midValue = (min + max) / 2;

  // Market may be less than 24hr old so padd the data array
  // with values that is the mid value (avg of min and max).
  // This will rendera  horizontal line until the real data shifts the line
  const padCount = points - data.length;
  const padArr = new Array(padCount).fill(midValue);

  const lineData: [number, number][] = [...padArr, ...data].map((d, i) => {
    return [i, d];
  });

  const xScale = scaleLinear().domain([0, points]).range([0, width]);
  const yScale = scaleLinear().domain([min, max]).range([height, 0]);

  const lineSeries = line()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  const areaSeries = area()
    .x((d) => xScale(d[0]))
    .y0(height)
    .y1((d) => yScale(d[1]));

  const firstVal = data[0];
  const lastVal = data[data.length - 1];

  // Get the color of the marketData line depending on market movement
  const strokeClassName = colorByChange(firstVal, lastVal);
  const areaClassName = shadedColor(firstVal, lastVal);

  // Create paths
  const mainPath = lineSeries(lineData);
  const shadedArea = areaSeries(lineData);

  return (
    <svg
      data-testid="sparkline-svg"
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {mainPath && (
        <path
          d={mainPath}
          data-testid="sparkline-path"
          className={`[vector-effect:non-scaling-stroke] fill-transparent ${strokeClassName}`}
          strokeWidth={1}
        />
      )}
      {shadedArea && (
        <path
          className={areaClassName}
          fillOpacity={0.2}
          stroke="none"
          d={shadedArea}
        />
      )}
    </svg>
  );
};

SparklineView.displayName = 'SparklineView';

// Use react memo to only re-render if props change
export const Sparkline = React.memo(
  SparklineView,
  function (prevProps, nextProps) {
    // Warning! The return value here is the opposite of shouldComponentUpdate.
    // Return true if you DON NOT want a re-render
    if (
      prevProps.width !== nextProps.width ||
      prevProps.height !== nextProps.height
    ) {
      return false;
    }
    return isEqual(prevProps.data, nextProps.data);
  }
);

Sparkline.displayName = 'Sparkline';
