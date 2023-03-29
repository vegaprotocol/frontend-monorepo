import { addDecimal } from '@vegaprotocol/utils';
import uniqBy from 'lodash/uniqBy';
import reverse from 'lodash/reverse';

interface PriceLevel {
  price: number;
  volume: number;
}

interface RawPriceLevel {
  price: string;
  volume: string;
}

/**
 * Parse price level strings to numbers
 *
 * @param rawPriceLevel Price level represented by string values
 * @param priceDecimalPlaces Number of decimal places used to interpret price string
 * @param volumeDecimalPlaces Number of decimal places used to interpret volume string
 */
export const parseLevel = (
  rawPriceLevel: RawPriceLevel,
  priceDecimalPlaces = 0,
  volumeDecimalPlaces = 0
): PriceLevel => ({
  price: Number(addDecimal(rawPriceLevel.price, priceDecimalPlaces)),
  volume: Number(addDecimal(rawPriceLevel.volume, volumeDecimalPlaces)),
});

/**
 * Apply price level updates to current price levels. This can involve
 * adding, updating, or removing single price levels.
 *
 * @param levels The current price levels
 * @param updates Price level updates
 * @param decimalPlaces Number of decimal places used to interpret price string
 * @param positionDecimalPlaces Number of decimal places used to interpret volume string
 * @param reverse If true the price levels are in descending price order, otherwise they are in ascending price order
 */
export const updateLevels = (
  levels: PriceLevel[],
  updates: RawPriceLevel[],
  decimalPlaces: number,
  positionDecimalPlaces: number,
  ascending = true
) => {
  uniqBy(reverse(updates || []), 'price').forEach((update) => {
    const updateLevel = parseLevel(
      update,
      decimalPlaces,
      positionDecimalPlaces
    );

    let index = levels.findIndex(
      (level) =>
        Math.abs(level.price - updateLevel.price) < 10 ** -(decimalPlaces + 1)
    );

    if (index !== -1) {
      if (update.volume === '0') {
        levels.splice(index, 1);
      } else {
        Object.assign(levels[index], updateLevel);
      }
    } else if (update.volume !== '0') {
      index = levels.findIndex((level) =>
        ascending
          ? level.price > updateLevel.price
          : level.price < updateLevel.price
      );
      if (index !== -1) {
        levels.splice(index, 0, updateLevel);
      } else {
        levels.push(updateLevel);
      }
    }
  });

  return levels;
};
