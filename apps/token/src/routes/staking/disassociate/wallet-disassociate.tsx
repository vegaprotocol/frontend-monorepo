import React from "react";
import { useTranslation } from "react-i18next";

import { TokenInput } from "../../../components/token-input";
import { useAppState } from "../../../contexts/app-state/app-state-context";

export const WalletDisassociate = ({
  perform,
  amount,
  setAmount,
}: {
  perform: () => void;
  amount: string;
  setAmount: React.Dispatch<string>;
}) => {
  const {
    appState: { walletAssociatedBalance },
  } = useAppState();
  const { t } = useTranslation();

  if (!walletAssociatedBalance || walletAssociatedBalance.isEqualTo("0")) {
    return (
      <div className="disassociate-page__error">
        {t(
          "You have no VEGA tokens currently staked through your connected Vega wallet."
        )}
      </div>
    );
  }

  return (
    <TokenInput
      submitText={t("Disassociate VEGA Tokens from key")}
      perform={perform}
      maximum={walletAssociatedBalance}
      amount={amount}
      setAmount={setAmount}
      currency={t("VEGA Tokens")}
    />
  );
};
