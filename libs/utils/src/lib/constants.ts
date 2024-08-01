export const MAXGOINT64 = '9223372036854775807';
// The fix for the close position functionality needs MaxInt64/2 for the size
// Issue: https://github.com/vegaprotocol/vega/issues/10177
// Core PR: https://github.com/vegaprotocol/vega/pull/10178
export const HALFMAXGOINT64 = '4611686018427387903';

export const SEC = 1000;
export const MIN = SEC * 60;
export const HOUR = MIN * 60;
export const DAY = HOUR * 24;
