/** Returns date in a format suitable for input[type=date] elements */
export const formatForInput = (date: Date) => {
  const padZero = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const secs = padZero(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${secs}`;
};
