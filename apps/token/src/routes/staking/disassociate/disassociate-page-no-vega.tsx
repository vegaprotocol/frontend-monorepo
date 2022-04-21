import "./disassociate-page.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  StakingMethod,
  StakingMethodRadio,
} from "../../../components/staking-method-radio";
import { useSearchParams } from "../../../hooks/use-search-params";
import { ConnectToVega } from "../connect-to-vega";
import { ContractDisassociate } from "./contract-disassociate";

export const DisassociatePageNoVega = () => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const [amount, setAmount] = React.useState<string>("");
  const [selectedStakingMethod, setSelectedStakingMethod] = React.useState<
    StakingMethod | ""
  >(params.method as StakingMethod | "");

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
      <h2>{t("What Vega wallet are you removing Tokens from?")}</h2>
      <ConnectToVega />
      <h2>{t("What tokens would you like to return?")}</h2>
      <StakingMethodRadio
        setSelectedStakingMethod={setSelectedStakingMethod}
        selectedStakingMethod={selectedStakingMethod}
      />
      {selectedStakingMethod &&
        (selectedStakingMethod === StakingMethod.Wallet ? (
          <ConnectToVega />
        ) : (
          <ContractDisassociate
            setAmount={setAmount}
            amount={amount}
            perform={() => {}}
          />
        ))}
    </section>
  );
};
