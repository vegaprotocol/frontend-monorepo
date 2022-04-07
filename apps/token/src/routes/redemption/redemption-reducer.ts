import { Tranche } from "@vegaprotocol/smart-contracts-sdk";

import { BigNumber } from "../../lib/bignumber";

export interface TrancheBalance {
  id: number;
  locked: BigNumber;
  vested: BigNumber;
}

export interface RedemptionState {
  userTranches: Tranche[];
}

export const initialRedemptionState: RedemptionState = {
  userTranches: [],
};

export enum RedemptionActionType {
  SET_USER_TRANCHES,
}

export type RedemptionAction = {
  type: RedemptionActionType.SET_USER_TRANCHES;
  userTranches: Tranche[];
};

export function redemptionReducer(
  state: RedemptionState,
  action: RedemptionAction
): RedemptionState {
  switch (action.type) {
    case RedemptionActionType.SET_USER_TRANCHES:
      return {
        ...state,
        userTranches: action.userTranches,
      };
  }
}
