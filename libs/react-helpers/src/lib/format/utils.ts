import capitalize from 'lodash/capitalize';
import startCase from 'lodash/startCase';

export const getUserLocale = () => 'default';

export const splitAt = (index: number) => (x: string) =>
  [x.slice(0, index), x.slice(index)];

export const formatLabel = (str: string) =>
  capitalize(startCase(str).toLowerCase());
