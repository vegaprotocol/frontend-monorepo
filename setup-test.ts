import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
