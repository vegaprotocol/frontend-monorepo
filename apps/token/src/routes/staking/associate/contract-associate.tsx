import "./contract-associate.scss";

import { Callout } from "@vegaprotocol/ui-toolkit";
import React from "react";
import { useTranslation } from "react-i18next";

import { TokenInput } from "../../../components/token-input";
import {
  useAppState,
  VegaKeyExtended,
} from "../../../contexts/app-state/app-state-context";
import { BigNumber } from "../../../lib/bignumber";
import { AssociateInfo } from "./associate-info";

export const ContractAssociate = ({
  perform,
  amount,
  setAmount,
  vegaKey,
}: {
  perform: () => void;
  amount: string;
  setAmount: React.Dispatch<string>;
  vegaKey: VegaKeyExtended | null;
}) => {
  const { t } = useTranslation();
  const {
    appState: { balanceFormatted, lien },
  } = useAppState();

  const maximum = React.useMemo(() => {
    return new BigNumber(balanceFormatted).minus(lien!);
  }, [balanceFormatted, lien]);

  let pageContent = null;
  if (new BigNumber(balanceFormatted).isEqualTo("0")) {
    pageContent = (
      <div className="contract-associate__error">
        {t("You have no VEGA tokens currently vesting.")}
      </div>
    );
  } else if (new BigNumber(balanceFormatted).minus(lien).isEqualTo("0")) {
    pageContent = (
      <div className="contract-associate__error">
        {t(
          "All VEGA tokens vesting in the connected wallet have already been associated."
        )}
      </div>
    );
  } else {
    pageContent = (
      <>
        <Callout>
          {t(
            "You can associate tokens while they are held in the vesting contract, when they unlock you will need to dissociate them before they can be redeemed."
          )}
        </Callout>
        <AssociateInfo pubKey={vegaKey ? vegaKey.pub : null} />
        <TokenInput
          submitText={t("Associate VEGA Tokens with key")}
          perform={perform}
          maximum={maximum}
          amount={amount}
          setAmount={setAmount}
          currency={t("VEGA Tokens")}
        />
      </>
    );
  }

  return (
    <section className="contract-associate" data-testid="contract-associate">
      {pageContent}
    </section>
  );
};
