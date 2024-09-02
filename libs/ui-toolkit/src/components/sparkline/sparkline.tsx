import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { area, line } from 'd3-shape';
import isEqual from 'lodash/isEqual';
import React from 'react';

function colorByChange(a: number, b: number) {
  if (a < b) {
    return 'stroke-dir-up-outline';
  } else if (a > b) {
    return 'stroke-dir-down-outline';
  }
  return 'stroke-black/40 dark:stroke-white/40';
}

function shadedColor(a: number, b: number) {
  if (a < b) {
    return 'fill-dir-up';
  } else if (a > b) {
    return 'fill-dir-down';
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
  data: rawData,
  width = 60,
  height = 15,
  points = 24,
  className,
}: SparklineProps) => {
  // Value can come in as 0, due to candle.close being empty string ''
  // Instead of skewing the sparkline with 0 values, we map over and set any
  // 0 values to the last non 0 value resulting in a better sparkline
  let lastClose = 0;
  const data = rawData.map((val) => {
    if (val === 0) {
      return lastClose;
    } else {
      lastClose = val;
    }

    return val;
  });

  // Get the extent for our y value
  const [min, max] = extent(data, (d) => d);

  if (typeof min !== 'number' || typeof max !== 'number') {
    return null;
  }

  // Market may be less than 24hr old so padd the data array
  // with values that is the mid value (avg of min and max).
  // This will rendera  horizontal line until the real data shifts the line
  const trimmedData = data.slice(-points);
  const padCount = data.length < points ? points - data.length : 0;
  const padArr = new Array(padCount).fill(trimmedData[0]);

  // Get the last 24 values if data has more than needed
  const lineData: [number, number][] = [...padArr, ...trimmedData].map(
    (d, i) => {
      return [i, d];
    }
  );

  const xScale = scaleLinear().domain([0, points]).range([0, width]);
  const yScale = scaleLinear().domain([min, max]).range([height, 0]);

  const lineSeries = line()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  const areaSeries = area()
    .x((d) => xScale(d[0]))
    .y0(height)
    .y1((d) => yScale(d[1]));

  const firstVal = trimmedData[0];
  const lastVal = trimmedData[trimmedData.length - 1];

  // Get the color of the marketData line depending on market movement
  const strokeClassName = colorByChange(firstVal, lastVal);
  const areaClassName = shadedColor(firstVal, lastVal);

  // Create paths
  const linePath = lineSeries(lineData);
  const areaPath = areaSeries(lineData);

  return (
    <svg
      data-testid="sparkline-svg"
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {linePath && (
        <path
          d={linePath}
          data-testid="sparkline-path"
          className={`[vector-effect:non-scaling-stroke] fill-transparent ${strokeClassName}`}
          strokeWidth={1}
        />
      )}
      {areaPath && (
        <path
          className={areaClassName}
          fillOpacity={0.2}
          stroke="none"
          d={areaPath}
        />
      )}
    </svg>
  );
};

SparklineView.displayName = 'SparklineView';

export const Sparkline = React.memo(
  SparklineView,
  function (prevProps, nextProps) {
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
