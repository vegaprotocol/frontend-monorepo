import { Tranche } from "@vegaprotocol/smart-contracts-sdk";

import { BigNumber } from "../bignumber";

export function generateTranche(id: number): Tranche {
  return {
    tranche_id: id,
    tranche_start: new Date(),
    tranche_end: new Date(),
    total_added: new BigNumber(0),
    total_removed: new BigNumber(0),
    locked_amount: new BigNumber(0),
    deposits: [],
    withdrawals: [],
    users: [],
  };
}

export function generateTranches(count = 1) {
  return new Array(count).fill(null).map((_, i) => generateTranche(i));
}
