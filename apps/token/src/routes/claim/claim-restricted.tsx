import { useTranslation } from "react-i18next";

export const ClaimRestricted = () => {
  const { t } = useTranslation();
  return (
    <section>
      <h1>{t("Service unavailable")}</h1>
      <p>{t("This service is not available in your country")}</p>
    </section>
  );
};
