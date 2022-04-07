import { Callout } from "@vegaprotocol/ui-toolkit";
import { useTranslation } from "react-i18next";

import { Error } from "../../components/icons";

// TODO: Provide a better message
export const TrancheNotFound = () => {
  const { t } = useTranslation();
  return (
    <Callout intent="error" icon={<Error />}>
      <p>{t("Tranche not found")}</p>
    </Callout>
  );
};
