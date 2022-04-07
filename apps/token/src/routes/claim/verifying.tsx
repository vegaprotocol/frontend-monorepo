import { useTranslation } from "react-i18next";

import { SplashLoader } from "../../components/splash-loader";

export const Verifying = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        minHeight: 260,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SplashLoader text={t("Verifying your claim")} />
    </div>
  );
};
