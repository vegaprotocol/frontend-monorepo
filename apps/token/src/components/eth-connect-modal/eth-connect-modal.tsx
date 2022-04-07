import "./eth-connect-modal.scss";

import { Overlay } from "@blueprintjs/core";
import * as Sentry from "@sentry/react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";
import React from "react";
import { useTranslation } from "react-i18next";

import {
  AppStateActionType,
  useAppState,
} from "../../contexts/app-state/app-state-context";
import { useWeb3Connect } from "../../hooks/use-web3";
import { Connectors, NETWORK_KEY } from "../../lib/connectors";
import { isAlreadyProcessing, isUserRejection } from "../../lib/web3-utils";
import { Modal } from "../modal";

export const EthConnectModal = () => {
  const { t } = useTranslation();
  const { appState, appDispatch } = useAppState();
  const { connector, error } = useWeb3React();
  const { connect } = useWeb3Connect();
  const [activatingConnector, setActivatingConnector] =
    React.useState<any>(null);

  const close = React.useCallback(
    () =>
      appDispatch({
        type: AppStateActionType.SET_ETH_WALLET_OVERLAY,
        isOpen: false,
      }),
    [appDispatch]
  );

  // When the activating connector equals the current connector activation is complete, we can
  // close the modal. However, only if there is no error. In that case keep the modal open
  // so we can show a message. EG. No provider found please install metamask
  React.useEffect(() => {
    if (!error && activatingConnector && activatingConnector === connector) {
      setActivatingConnector(null);
      close();
    }
  }, [activatingConnector, connector, error, close]);

  const getErrorMessage = (error: Error) => {
    if (error instanceof NoEthereumProviderError) {
      return t("noEthereumProviderError");
    } else if (error instanceof UnsupportedChainIdError) {
      return t("unsupportedChainIdError");
    } else if (
      isUserRejection(error) ||
      isAlreadyProcessing(error) ||
      error instanceof UserRejectedRequestErrorInjected ||
      error instanceof UserRejectedRequestErrorWalletConnect
    ) {
      return t("userRejectionError");
    } else {
      Sentry.captureException(error);
      return t("unknownEthereumConnectionError");
    }
  };

  return (
    <Overlay
      className="bp3-dark"
      isOpen={appState.ethConnectOverlay}
      onClose={close}
      transitionDuration={0}
    >
      <div className="modal modal--dark">
        <Modal title={t("connectEthWallet")}>
          <div>
            {error && (
              <p className="eth-connect-modal__error">
                {getErrorMessage(error)}
              </p>
            )}
            {Object.entries(Connectors).map(([key, connector]) => {
              if (key === NETWORK_KEY) return null;
              return (
                <button
                  key={key}
                  className="eth-connect-modal__button button-link"
                  type="button"
                  onClick={() => {
                    setActivatingConnector(connector);
                    connect(connector);
                  }}
                >
                  <div>{t(`${key}.name`)}</div>
                  <div>{t(`${key}.text`)}</div>
                </button>
              );
            })}
          </div>
        </Modal>
      </div>
    </Overlay>
  );
};
