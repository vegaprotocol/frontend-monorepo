import { Callout } from "@vegaprotocol/ui-toolkit";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  StakingMethod,
  StakingMethodRadio,
} from "../../../components/staking-method-radio";
import {
  useAppState,
  VegaKeyExtended,
} from "../../../contexts/app-state/app-state-context";
import { TxState } from "../../../hooks/transaction-reducer";
import { useSearchParams } from "../../../hooks/use-search-params";
import { AssociateTransaction } from "./associate-transaction";
import { ContractAssociate } from "./contract-associate";
import { useAddStake, usePollForStakeLinking } from "./hooks";
import { WalletAssociate } from "./wallet-associate";

export const AssociatePage = ({
  address,
  vegaKey,
  requiredConfirmations,
}: {
  address: string;
  vegaKey: VegaKeyExtended;
  requiredConfirmations: number;
}) => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const [amount, setAmount] = React.useState<string>("");

  const [selectedStakingMethod, setSelectedStakingMethod] = React.useState<
    StakingMethod | ""
  >("");

  // Clear the amount when the staking method changes
  React.useEffect(() => {
    setAmount("");
  }, [selectedStakingMethod]);

  const {
    state: txState,
    dispatch: txDispatch,
    perform: txPerform,
  } = useAddStake(
    address,
    amount,
    vegaKey.pub,
    selectedStakingMethod,
    requiredConfirmations
  );

  const linking = usePollForStakeLinking(vegaKey.pub, txState.txData.hash);

  const {
    appState: { walletBalance, totalVestedBalance, totalLockedBalance },
  } = useAppState();

  const zeroVesting = React.useMemo(
    () => totalVestedBalance.plus(totalLockedBalance).isEqualTo(0),
    [totalLockedBalance, totalVestedBalance]
  );
  const zeroVega = React.useMemo(
    () => walletBalance.isEqualTo(0),
    [walletBalance]
  );
  React.useEffect(() => {
    if (zeroVega && !zeroVesting) {
      setSelectedStakingMethod(StakingMethod.Contract);
    } else if (!zeroVega && zeroVesting) {
      setSelectedStakingMethod(StakingMethod.Wallet);
    } else {
      setSelectedStakingMethod(params.method as StakingMethod | "");
    }
  }, [params.method, zeroVega, zeroVesting]);
  if (txState.txState !== TxState.Default) {
    return (
      <AssociateTransaction
        amount={amount}
        vegaKey={vegaKey.pub}
        state={txState}
        dispatch={txDispatch}
        requiredConfirmations={requiredConfirmations}
        linking={linking}
      />
    );
  }

  return (
    <section data-testid="associate">
      <Callout>
        <p data-testid="associate-information1">{t("associateInfo1")}</p>
        <p data-testid="associate-information2">{t("associateInfo2")}</p>
      </Callout>
      {zeroVesting && zeroVega ? (
        <Callout intent="error">
          <p>{t("associateNoVega")}</p>
        </Callout>
      ) : (
        <>
          {!zeroVesting ? (
            <>
              <h2 data-testid="associate-subheader">
                {t("Where would you like to stake from?")}
              </h2>
              <p>{t("associationChoice")}</p>
              <StakingMethodRadio
                setSelectedStakingMethod={setSelectedStakingMethod}
                selectedStakingMethod={selectedStakingMethod}
              />
            </>
          ) : null}
        </>
      )}
      {selectedStakingMethod &&
        (selectedStakingMethod === StakingMethod.Contract ? (
          <ContractAssociate
            vegaKey={vegaKey}
            perform={txPerform}
            amount={amount}
            setAmount={setAmount}
          />
        ) : (
          <WalletAssociate
            address={address}
            vegaKey={vegaKey}
            perform={txPerform}
            amount={amount}
            setAmount={setAmount}
          />
        ))}
    </section>
  );
};
