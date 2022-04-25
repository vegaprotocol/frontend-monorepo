import { useTranslation } from "react-i18next";

import { ConnectedVegaKey } from "../../../components/connected-vega-key";

export const AssociateInfo = ({ pubKey }: { pubKey: string | null }) => {
  const { t } = useTranslation();
  return (
    <>
      <h2 data-testid="associate-vega-key-header">
        {t("What Vega wallet/key is going to control your stake?")}
      </h2>
      <ConnectedVegaKey pubKey={pubKey} />
      <h2 data-testid="associate-amount-header">
        {t("How much would you like to associate?")}
      </h2>
    </>
  );
};
