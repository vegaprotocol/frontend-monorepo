import { useTranslation } from "react-i18next";

import {
  AppStateActionType,
  useAppState,
} from "../../contexts/app-state/app-state-context";

interface EthConnectPrompProps {
  children?: React.ReactNode;
}

export const EthConnectPrompt = ({ children }: EthConnectPrompProps) => {
  const { t } = useTranslation();
  const { appDispatch } = useAppState();
  return (
    <>
      {children}
      <button
        onClick={() =>
          appDispatch({
            type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
            isOpen: true,
          })
        }
        className="fill"
        type="button"
        data-testid="connect-to-eth-btn"
      >
        {t("connectEthWallet")}
      </button>
    </>
  );
};
