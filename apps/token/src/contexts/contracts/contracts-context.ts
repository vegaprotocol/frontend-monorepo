import {
  TxData,
  VegaClaim,
  VegaErc20Bridge,
  VegaStaking,
  VegaToken,
  VegaVesting,
} from "@vegaprotocol/smart-contracts-sdk";
import React from "react";

export interface ContractsContextShape {
  token: VegaToken;
  staking: VegaStaking;
  vesting: VegaVesting;
  claim: VegaClaim;
  erc20Bridge: VegaErc20Bridge;
  transactions: TxData[];
}

export const ContractsContext = React.createContext<
  ContractsContextShape | undefined
>(undefined);

export function useContracts() {
  const context = React.useContext(ContractsContext);
  if (context === undefined) {
    throw new Error("useContracts must be used within ContractsProvider");
  }
  return context;
}
