import "./vega-wallet-not-running.scss";

import { useTranslation } from "react-i18next";

import { FormGroup } from "../form-group";

interface VegaWalletNotRunningProps {
  url: string;
  setUrl: (url: string) => void;
}

export const VegaWalletNotRunning = ({
  url,
  setUrl,
}: VegaWalletNotRunningProps) => {
  const { t } = useTranslation();

  return (
    <div className="vega-wallet-not-running__container">
      <div className="vega-wallet-not-running__input">
        <FormGroup
          label={t("walletServiceLabel")}
          labelFor="wallet-service-url"
        >
          <input
            name="wallet-service-url"
            id="wallet-service-url"
            type="text"
            className="bp3-input"
            onChange={(e) => setUrl(e.target.value)}
            value={url}
          />
        </FormGroup>
      </div>
      <div className="vega-wallet-not-running__text-container">
        <div className="vega-wallet-not-running__exclamation">!</div>
        <div className="vega-wallet-not-running__text">
          <p>{t("noWalletDetected")}</p>
          <p>{t("noWalletHelpText")}</p>
        </div>
      </div>
    </div>
  );
};
