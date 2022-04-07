import "./disassociate-page.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import { ConnectedVegaKey } from "../../../components/connected-vega-key";
import {
  StakingMethod,
  StakingMethodRadio,
} from "../../../components/staking-method-radio";
import { VegaKeyExtended } from "../../../contexts/app-state/app-state-context";
import { TxState } from "../../../hooks/transaction-reducer";
import { useSearchParams } from "../../../hooks/use-search-params";
import { ContractDisassociate } from "./contract-disassociate";
import { DisassociateTransaction } from "./disassociate-transaction";
import { useRemoveStake } from "./hooks";
import { WalletDisassociate } from "./wallet-disassociate";

export const DisassociatePage = ({
  address,
  vegaKey,
}: {
  address: string;
  vegaKey: VegaKeyExtended;
}) => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const [amount, setAmount] = React.useState<string>("");
  const [selectedStakingMethod, setSelectedStakingMethod] = React.useState<
    StakingMethod | ""
  >(params.method as StakingMethod | "");

  // Clear the amount when the staking method changes
  React.useEffect(() => {
    setAmount("");
  }, [selectedStakingMethod]);

  const {
    state: txState,
    dispatch: txDispatch,
    perform: txPerform,
  } = useRemoveStake(address, amount, vegaKey.pub, selectedStakingMethod);

  if (txState.txState !== TxState.Default) {
    return (
      <DisassociateTransaction
        state={txState}
        amount={amount}
        vegaKey={vegaKey.pub}
        stakingMethod={selectedStakingMethod as StakingMethod}
        dispatch={txDispatch}
      />
    );
  }

  return (
    <section className="disassociate-page" data-testid="disassociate-page">
      <p>
        {t(
          "Use this form to disassociate VEGA tokens with a Vega key. This returns them to either the Ethereum wallet that used the Staking bridge or the vesting contract."
        )}
      </p>
      <p>
        <span className="disassociate-page__error">{t("Warning")}:</span>{" "}
        {t(
          "Any Tokens that have been nominated to a node will sacrifice any Rewards they are due for the current epoch. If you do not wish to sacrifices fees you should remove stake from a node at the end of an epoch before disassocation."
        )}
      </p>
      <h1>{t("What Vega wallet are you removing Tokens from?")}</h1>
      <ConnectedVegaKey pubKey={vegaKey.pub} />
      <h1>{t("What tokens would you like to return?")}</h1>
      <StakingMethodRadio
        setSelectedStakingMethod={setSelectedStakingMethod}
        selectedStakingMethod={selectedStakingMethod}
      />
      {selectedStakingMethod &&
        (selectedStakingMethod === StakingMethod.Wallet ? (
          <WalletDisassociate
            setAmount={setAmount}
            amount={amount}
            perform={txPerform}
          />
        ) : (
          <ContractDisassociate
            setAmount={setAmount}
            amount={amount}
            perform={txPerform}
          />
        ))}
    </section>
  );
};
