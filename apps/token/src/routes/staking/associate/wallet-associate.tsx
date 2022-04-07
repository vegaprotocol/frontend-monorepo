import "./wallet-associate.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import { TokenInput } from "../../../components/token-input";
import { ADDRESSES } from "../../../config";
import {
  AppStateActionType,
  useAppState,
  VegaKeyExtended,
} from "../../../contexts/app-state/app-state-context";
import { useContracts } from "../../../contexts/contracts/contracts-context";
import { TxState } from "../../../hooks/transaction-reducer";
import { useTransaction } from "../../../hooks/use-transaction";
import { BigNumber } from "../../../lib/bignumber";
import { AssociateInfo } from "./associate-info";

export const WalletAssociate = ({
  perform,
  vegaKey,
  amount,
  setAmount,
  address,
}: {
  perform: () => void;
  amount: string;
  setAmount: React.Dispatch<string>;
  vegaKey: VegaKeyExtended;
  address: string;
}) => {
  const { t } = useTranslation();
  const {
    appDispatch,
    appState: { walletBalance, allowance, walletAssociatedBalance },
  } = useAppState();

  const { token } = useContracts();

  const {
    state: approveState,
    perform: approve,
    dispatch: approveDispatch,
  } = useTransaction(() => token.approve(ADDRESSES.stakingBridge));

  // Once they have approved deposits then we need to refresh their allowance
  React.useEffect(() => {
    const run = async () => {
      if (approveState.txState === TxState.Complete) {
        const allowance = await token.allowance(
          address,
          ADDRESSES.stakingBridge
        );
        appDispatch({
          type: AppStateActionType.SET_ALLOWANCE,
          allowance,
        });
      }
    };
    run();
  }, [address, appDispatch, approveState.txState, token]);

  let pageContent = null;

  if (
    walletBalance.isEqualTo("0") &&
    new BigNumber(walletAssociatedBalance!).isEqualTo("0")
  ) {
    pageContent = (
      <div className="wallet-associate__error">
        {t(
          "You have no VEGA tokens in your connected wallet. You will need to buy some VEGA tokens from an exchange in order to stake using this method."
        )}
      </div>
    );
  } else if (
    walletBalance.isEqualTo("0") &&
    !new BigNumber(walletAssociatedBalance!).isEqualTo("0")
  ) {
    pageContent = (
      <div className="wallet-associate__error">
        {t(
          "All VEGA tokens in the connected wallet is already associated with a Vega wallet/key"
        )}
      </div>
    );
  } else {
    pageContent = (
      <>
        <AssociateInfo pubKey={vegaKey.pub} />
        <TokenInput
          approveText={t("Approve VEGA tokens for staking on Vega")}
          submitText={t("Associate VEGA Tokens with key")}
          requireApproval={true}
          allowance={allowance}
          approve={approve}
          perform={perform}
          amount={amount}
          setAmount={setAmount}
          maximum={walletBalance}
          approveTxState={approveState}
          approveTxDispatch={approveDispatch}
          currency={t("VEGA Tokens")}
        />
      </>
    );
  }

  return <section data-testid="wallet-associate">{pageContent}</section>;
};
