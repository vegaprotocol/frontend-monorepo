import React from "react";
import { useTranslation } from "react-i18next";

import {
  AppStateActionType,
  useAppState,
} from "../../contexts/app-state/app-state-context";

export const ConnectToVega = () => {
  const { appDispatch } = useAppState();
  const { t } = useTranslation();
  return (
    <button
      onClick={() =>
        appDispatch({
          type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
          isOpen: true,
        })
      }
      className="fill"
      data-test-id="connect-to-vega-wallet-btn"
    >
      {t("connectVegaWallet")}
    </button>
  );
};
