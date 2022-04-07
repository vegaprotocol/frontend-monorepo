import "./connected-vega-key.scss";

import { useTranslation } from "react-i18next";

import { ConnectToVega } from "../../routes/staking/connect-to-vega";

export const ConnectedVegaKey = ({ pubKey }: { pubKey: string | null }) => {
  const { t } = useTranslation();
  return (
    <section className="connected-vega-key">
      <strong data-testid="connected-vega-key-label">
        {pubKey ? t("Connected Vega key") : <ConnectToVega />}
      </strong>
      <p data-testid="connected-vega-key">{pubKey}</p>
    </section>
  );
};
