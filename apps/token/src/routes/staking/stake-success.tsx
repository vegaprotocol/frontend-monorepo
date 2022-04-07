import { Callout } from "@vegaprotocol/ui-toolkit";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Tick } from "../../components/icons";
import { Routes } from "../router-config";
import { Actions, RemoveType, StakeAction } from "./staking-form";

interface StakeSuccessProps {
  action: StakeAction;
  amount: string;
  nodeName: string;
  removeType: RemoveType;
}

export const StakeSuccess = ({
  action,
  amount,
  nodeName,
  removeType,
}: StakeSuccessProps) => {
  const { t } = useTranslation();
  const isAdd = action === Actions.Add;
  const title = isAdd
    ? t("stakeAddSuccessTitle", { amount })
    : t("stakeRemoveSuccessTitle", { amount, node: nodeName });
  const message = isAdd
    ? t("stakeAddSuccessMessage")
    : removeType === RemoveType.EndOfEpoch
    ? t("stakeRemoveSuccessMessage")
    : t("stakeRemoveNowSuccessMessage");

  return (
    <Callout icon={<Tick />} intent="success" title={title}>
      <div>
        <p>{message}</p>
        <p>
          <Link to={Routes.STAKING}>{t("backToStaking")}</Link>
        </p>
      </div>
    </Callout>
  );
};
