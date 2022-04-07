import "./epoch-countdown.scss";

import { Intent, ProgressBar } from "@blueprintjs/core";
import { format, formatDistanceStrict } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";

import arrow from "../../images/back.png";
import { DATE_FORMAT_DETAILED } from "../../lib/date-formats";

export interface EpochCountdownProps {
  id: string;
  startDate: Date;
  endDate: Date;
  containerClass?: string;
}

export function EpochCountdown({
  id,
  startDate,
  endDate,
  containerClass,
}: EpochCountdownProps) {
  const { t } = useTranslation();
  const [now, setNow] = React.useState(Date.now());

  // number between 0 and 1 for percentage progress
  const progress = React.useMemo(() => {
    const start = startDate.getTime();
    const end = endDate.getTime();

    if (now > end) {
      return 1;
    }

    // round it to make testing easier
    return Number(((now - start) / (end - start)).toFixed(2));
  }, [startDate, endDate, now]);

  // format end date into readable 'time until' text
  const endsIn = React.useMemo(() => {
    if (endDate.getTime() > now) {
      return formatDistanceStrict(now, endDate);
    }
    return 0;
  }, [now, endDate]);

  // start interval updating current time stamp until
  // its passed the end date
  React.useEffect(() => {
    const interval = setInterval(() => {
      const d = Date.now();
      setNow(d);

      if (d > endDate.getTime()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div
      data-testid="epoch-countdown"
      className={`${containerClass} epoch-countdown`}
    >
      <div className="epoch-countdown__title">
        <h3>
          {t("Epoch")} {id}
        </h3>
        <p>
          {endsIn
            ? t("Next epoch in {{endText}}", { endText: endsIn })
            : t("Awaiting next epoch")}
        </p>
      </div>
      <ProgressBar
        animate={false}
        value={progress}
        stripes={false}
        intent={Intent.NONE}
      />
      <div className="epoch-countdown__time-range">
        <p>{format(startDate, DATE_FORMAT_DETAILED)}</p>
        <div className="epoch-countdown__arrow">
          <img alt="arrow" src={arrow} />
        </div>
        <p>{format(endDate, DATE_FORMAT_DETAILED)}</p>
      </div>
    </div>
  );
}
