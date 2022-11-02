export const toNanoSeconds = (date: Date | string) => {
  return new Date(date).getTime().toString() + '000000';
};

export const fromNanoSeconds = (ts: string) => {
  if (typeof ts !== 'string') return new Date(0);
  const validTs = ts.substring(0, ts.length - 6);
  return new Date(Number(validTs));
};
