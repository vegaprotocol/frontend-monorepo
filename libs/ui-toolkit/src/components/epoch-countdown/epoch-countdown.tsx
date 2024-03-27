import { formatDistanceStrict } from 'date-fns';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { HighlightProgressBar as ProgressBar } from '../highlight-progress-bar';

export interface EpochCountdownProps {
  id: string;
  startDate: Date;
  endDate: Date;
}

export function EpochCountdown({
  id,
  startDate,
  endDate,
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
    <div data-testid="epoch-countdown" className="epoch-countdown">
      <div className="flex items-end mb-3">
        <h3 className="flex-1 m-0 text-sm">
          {t('Epoch')} {id}
        </h3>
        <p className="text-sm m-0">
          {endsIn
            ? t('Next epoch in {{endText}}', { endText: endsIn })
            : t('Awaiting next epoch')}
        </p>
      </div>
      <ProgressBar value={progress} />
    </div>
  );
}
