import "./splash-error.scss";

import { useTranslation } from "react-i18next";

export const SplashError = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="splash-error__icon">
        <span />
        <span />
      </div>
      {t("networkDown")}
    </div>
  );
};
