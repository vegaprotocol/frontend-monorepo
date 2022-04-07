import React from "react";
import { useTranslation } from "react-i18next";

export const ClaimError = () => {
  const { t } = useTranslation()
  return (
    <section>
      <h1 data-testid="invalid-claim-code-error-msg">{t("Something doesn't look right")}</h1>
      <p>{t("If you have been given a link please double check and try again")}</p>
    </section>
  );
};
