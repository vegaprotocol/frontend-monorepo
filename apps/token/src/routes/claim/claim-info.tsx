import { Tranche } from "@vegaprotocol/smart-contracts-sdk";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { DATE_FORMAT_LONG } from "../../lib/date-formats";

interface ClaimInfoProps {
  tranche: Tranche;
}

export const ClaimInfo = ({ tranche }: ClaimInfoProps) => {
  const { t } = useTranslation();
  const unlockDate = format(
    new Date(tranche.tranche_start).getTime(),
    DATE_FORMAT_LONG
  );
  const trancheEndDate = format(
    new Date(tranche.tranche_end).getTime(),
    DATE_FORMAT_LONG
  );
  const fullyRedeemable =
    new Date().getTime() > new Date(tranche.tranche_end).getTime();
  const partiallyRedeemable =
    !fullyRedeemable &&
    new Date().getTime() > new Date(tranche.tranche_start).getTime();
  const noneRedeemable = !fullyRedeemable && !partiallyRedeemable;

  return (
    <>
      {noneRedeemable && (
        <p>
          {t("none redeemable", {
            unlockDate,
            trancheEndDate,
          })}
        </p>
      )}
      {partiallyRedeemable && (
        <p>
          {t("partially redeemable", {
            unlockDate,
            trancheEndDate,
          })}
        </p>
      )}
      {fullyRedeemable && (
        <p>
          {t("fully redeemable", {
            unlockDate,
            trancheEndDate,
          })}
        </p>
      )}
    </>
  );
};
