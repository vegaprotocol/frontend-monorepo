import { TxData } from "@vegaprotocol/smart-contracts-sdk";
import {
  VegaClaim,
  VegaErc20Bridge,
  VegaStaking,
  VegaToken,
  VegaVesting,
} from "@vegaprotocol/smart-contracts-sdk";
import { useWeb3React } from "@web3-react/core";
import uniqBy from "lodash/uniqBy";
import React from "react";

import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { APP_ENV } from "../../config";
import { ContractsContext, ContractsContextShape } from "./contracts-context";

/**
 * Provides Vega Ethereum contract instances to its children.
 */
export const ContractsProvider = ({ children }: { children: JSX.Element }) => {
  const { library, account } = useWeb3React();
  const [txs, setTxs] = React.useState<TxData[]>([]);
  const [contracts, setContracts] = React.useState<Pick<
    ContractsContextShape,
    "token" | "staking" | "vesting" | "claim" | "erc20Bridge"
  > | null>(null);

  // Create instances of contract classes. If we have an account use a signer for the
  // contracts so that we can sign transactions, otherwise use the provider for just
  // reading data
  React.useEffect(() => {
    let signer = null;

    if (account && library && typeof library.getSigner === "function") {
      signer = library.getSigner();
    }

    if (library) {
      setContracts({
        token: new VegaToken(APP_ENV, library, signer),
        staking: new VegaStaking(APP_ENV, library, signer),
        vesting: new VegaVesting(APP_ENV, library, signer),
        claim: new VegaClaim(APP_ENV, library, signer),
        erc20Bridge: new VegaErc20Bridge(APP_ENV, library, signer),
      });
    }
  }, [library, account]);

  React.useEffect(() => {
    if (!contracts) return;

    const mergeTxs = (existing: TxData[], incoming: TxData[]) => {
      return uniqBy([...incoming, ...existing], "tx.hash");
    };

    contracts.staking.listen((txs) => {
      setTxs((curr) => mergeTxs(curr, txs));
    });

    contracts.vesting.listen((txs) => {
      setTxs((curr) => mergeTxs(curr, txs));
    });
  }, [contracts]);

  React.useEffect(() => {
    setTxs([]);
  }, [account]);

  if (!contracts) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  return (
    <ContractsContext.Provider value={{ ...contracts, transactions: txs }}>
      {children}
    </ContractsContext.Provider>
  );
};
