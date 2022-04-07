import { Callout } from "@vegaprotocol/ui-toolkit";
import { useTranslation } from "react-i18next";

import { AddLockedTokenAddress } from "../../components/add-locked-token";
import { Error } from "../../components/icons";

export const CodeUsed = () => {
  const { t } = useTranslation();
  return (
    <Callout intent="action" icon={<Error />} title={t("codeUsed")}>
      <p>{t("codeUsedText")}</p>
      <AddLockedTokenAddress />
    </Callout>
  );
};
