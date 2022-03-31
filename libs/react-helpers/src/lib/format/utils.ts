export const getUserLocale = () => 'default';

export const splitAt = (index: number) => (x: string) =>
  [x.slice(0, index), x.slice(index)];
