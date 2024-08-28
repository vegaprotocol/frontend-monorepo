const SEC = 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;

export const Time = {
  SEC,
  MIN,
  HOUR,
  DAY,
};

export function toNanoSeconds(timestamp: number) {
  return timestamp * 1_000_000;
}

export function fromNanoSeconds(timestamp: number | string) {
  return new Date(Number(timestamp) / 1_000_000);
}

export function now(roundBy = 1) {
  return Math.floor((Math.round(Date.now() / 1000) * 1000) / roundBy) * roundBy;
}

export function yesterday(roundBy = Time.MIN) {
  return now(roundBy) - DAY;
}
