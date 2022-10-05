export const toNanoSeconds = (date: Date | string) => {
  return new Date(date).getTime().toString() + '000000';
};
