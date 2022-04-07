import { Callout } from "@vegaprotocol/ui-toolkit";
import { useTranslation } from "react-i18next";

import { Loader } from "../../components/loader";
import { Actions, StakeAction } from "./staking-form";

interface StakePendingProps {
  action: StakeAction;
  amount: string;
  nodeName: string;
}

export const StakePending = ({
  action,
  amount,
  nodeName,
}: StakePendingProps) => {
  const { t } = useTranslation();
  const titleArgs = { amount, node: nodeName };
  const isAdd = action === Actions.Add;
  const title = isAdd
    ? t("stakeAddPendingTitle", titleArgs)
    : t("stakeRemovePendingTitle", titleArgs);

  return (
    <Callout icon={<Loader />} title={title}>
      <p>{t("timeForConfirmation")}</p>
    </Callout>
  );
};
