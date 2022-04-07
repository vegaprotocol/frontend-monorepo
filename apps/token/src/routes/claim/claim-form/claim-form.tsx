import * as Sentry from "@sentry/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router";

import { TransactionCallout } from "../../../components/transaction-callout";
import { useContracts } from "../../../contexts/contracts/contracts-context";
import {
  TransactionAction,
  TransactionActionType,
  TransactionState,
  TxState,
} from "../../../hooks/transaction-reducer";
import { Routes } from "../../router-config";

export interface ICountry {
  name: string;
  code: string;
}

enum CountryCheck {
  Default,
  Pending,
  Allowed,
  Blocked,
}

export const ClaimForm = ({
  txState,
  countryCode,
  txDispatch,
  onSubmit,
}: {
  txState: TransactionState;
  countryCode: string;
  txDispatch: React.Dispatch<TransactionAction>;
  onSubmit: () => void;
}) => {
  const [countryCheck, setCountryCheck] = React.useState(CountryCheck.Default);
  const { claim } = useContracts();
  const { t } = useTranslation();

  const handleOnClick = React.useCallback(async () => {
    setCountryCheck(CountryCheck.Pending);
    try {
      const blocked = await claim.isCountryBlocked(countryCode);
      if (!blocked) {
        setCountryCheck(CountryCheck.Allowed);
        onSubmit();
      } else {
        setCountryCheck(CountryCheck.Blocked);
      }
    } catch (err) {
      Sentry.captureException(err);
      setCountryCheck(CountryCheck.Blocked);
    }
  }, [claim, countryCode, onSubmit]);

  if (countryCheck === CountryCheck.Blocked) {
    return <Redirect to={Routes.NOT_PERMITTED} />;
  }

  if (txState.txState !== TxState.Default) {
    return (
      <TransactionCallout
        state={txState}
        reset={() => txDispatch({ type: TransactionActionType.TX_RESET })}
      />
    );
  }

  return (
    <button type="submit" onClick={handleOnClick} className="fill">
      {countryCheck === CountryCheck.Pending
        ? t("verifyingCountryPrompt")
        : t("Continue")}
    </button>
  );
};
