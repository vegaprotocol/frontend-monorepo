import React from "react";
import { useTranslation } from "react-i18next";

import { ConnectToVega } from "../connect-to-vega";

export const AssociatePageNoVega = () => {
  const { t } = useTranslation();
  return (
    <section data-testid="associate">
      <p data-testid="associate-information1">{t("associateInfo1")}</p>
      <p data-testid="associate-information2">{t("associateInfo2")}</p>

      {<ConnectToVega />}
    </section>
  );
};
