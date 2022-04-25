import { useTranslation } from "react-i18next";

import { Colors, Links } from "../../config";

export const DownloadWalletPrompt = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t("getWallet")}</h3>
      <p style={{ margin: 0 }}>
        <a
          style={{ color: Colors.DEEMPHASISE }}
          href={Links.WALLET_GUIDE}
          target="_blank"
          rel="noreferrer"
        >
          {t("readGuide")}
        </a>
      </p>
      <p style={{ margin: 0 }}>
        <a
          style={{ color: Colors.DEEMPHASISE }}
          href={Links.WALLET_RELEASES}
          target="_blank"
          rel="noreferrer"
        >
          {t("downloadWallet")}
        </a>
      </p>
    </>
  );
};
