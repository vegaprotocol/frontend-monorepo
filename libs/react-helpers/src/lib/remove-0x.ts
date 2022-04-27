import isString from 'lodash/isString';

/**
 * Removes a hex prefix from the start of a string
 *
 * @param str Hex string
 * @returns string
 */
export const remove0x = (str: string) => {
  // Should be prevented by typescript, but just in case...
  if (!isString(str)) {
    return str;
  }

  return str.replace(/^0x/, '');
};
