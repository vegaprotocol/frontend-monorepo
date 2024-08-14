// @ts-ignore -- @vegaprotocol/crypto is not typed
import { PoW } from '@vegaprotocol/crypto';

export default function () {
  return async function (args: {
    difficulty: number;
    blockHash: string;
    tid: string;
  }) {
    return PoW.solve(args.difficulty, args.blockHash, args.tid);
  };
}
