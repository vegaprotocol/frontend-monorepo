import type { ComponentProps } from 'react';
import type { Tag } from './tag';
import classNames from 'classnames';

// rainbow-ish order
export const TIER_COLORS: Array<ComponentProps<typeof Tag>['color']> = [
  'none', // worst tier if 8 tiers, otherwise relative to the best tier
  'red',
  'pink',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple', // best tier
];

export const getTierColor = (tier: number, max = TIER_COLORS.length) => {
  const available =
    max < TIER_COLORS.length
      ? TIER_COLORS.slice(TIER_COLORS.length - max)
      : TIER_COLORS;
  const tiers = Object.keys(available).length;
  let index = Math.abs(tier - 1);
  if (tier >= tiers) {
    index = index % tiers;
  }
  return available[index];
};

export const getTierGradient = (tier: number, max = TIER_COLORS.length) =>
  classNames({
    'from-vega-yellow-400 dark:from-vega-yellow-600 to-20%  bg-highlight':
      'yellow' === getTierColor(tier, max),
    'from-vega-green-400 dark:from-vega-green-600 to-20%  bg-highlight':
      'green' === getTierColor(tier, max),
    'from-vega-blue-400 dark:from-vega-blue-600 to-20%  bg-highlight':
      'blue' === getTierColor(tier, max),
    'from-vega-purple-400 dark:from-vega-purple-600 to-20%  bg-highlight':
      'purple' === getTierColor(tier, max),
    'from-vega-pink-400 dark:from-vega-pink-600 to-20%  bg-highlight':
      'pink' === getTierColor(tier, max),
    'from-vega-orange-400 dark:from-vega-orange-600 to-20%  bg-highlight':
      'orange' === getTierColor(tier, max),
    'from-vega-red-400 dark:from-vega-red-600 to-20%  bg-highlight':
      'red' === getTierColor(tier, max),
    'from-vega-clight-600 dark:from-vega-cdark-600 to-20%  bg-highlight':
      'none' === getTierColor(tier, max),
  });
