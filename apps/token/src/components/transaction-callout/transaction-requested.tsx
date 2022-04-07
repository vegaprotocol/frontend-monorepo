import { Callout } from "@vegaprotocol/ui-toolkit";
import { useTranslation } from "react-i18next";

import { HandUp } from "../icons";

export const TransactionRequested = () => {
  const { t } = useTranslation();
  return (
    <Callout
      icon={<HandUp />}
      intent="action"
      title={t("Awaiting action in Ethereum wallet (e.g. metamask)")}
    ></Callout>
  );
};
