import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { DATE_FORMAT_LONG } from "../../lib/date-formats";

interface TrancheDatesParams {
  start: Date;
  end: Date;
}

export const TrancheDates = ({ start, end }: TrancheDatesParams) => {
  const { t } = useTranslation();
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  if (startDate === endDate) {
    return (
      <span>
        {t("Fully vested on", { date: format(startDate, DATE_FORMAT_LONG) })}
      </span>
    );
  } else {
    return (
      <span>
        {t("Vesting from", {
          fromDate: format(startDate, DATE_FORMAT_LONG),
          endDate: format(endDate, DATE_FORMAT_LONG),
        })}
      </span>
    );
  }
};
