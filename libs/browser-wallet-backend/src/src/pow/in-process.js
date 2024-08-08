import { PoW } from '@vegaprotocol/crypto';

export default function () {
  return async function (args) {
    return PoW.solve(args.difficulty, args.blockHash, args.tid);
  };
}
