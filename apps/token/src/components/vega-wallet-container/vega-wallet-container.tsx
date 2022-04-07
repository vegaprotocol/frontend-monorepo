import React from "react";
import { useTranslation } from "react-i18next";

import {
  AppStateActionType,
  useAppState,
  VegaKeyExtended,
} from "../../contexts/app-state/app-state-context";
import { useVegaUser } from "../../hooks/use-vega-user";

interface VegaWalletContainerProps {
  children: (key: VegaKeyExtended) => React.ReactElement;
}

export const VegaWalletContainer = ({ children }: VegaWalletContainerProps) => {
  const { t } = useTranslation();
  const { currVegaKey } = useVegaUser();
  const { appDispatch } = useAppState();

  if (!currVegaKey) {
    return (
      <p>
        <button
          className="fill"
          onClick={() =>
            appDispatch({
              type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
              isOpen: true,
            })
          }
        >
          {t("connectVegaWallet")}
        </button>
      </p>
    );
  }

  return children(currVegaKey);
};
