import { convertToDuration } from '@vegaprotocol/utils';
import { useT } from '../use-t';

enum DurationKeys {
  Days = 'duration_days',
  Hours = 'duration_hours',
  Minutes = 'duration_minutes',
  Seconds = 'duration_seconds',
  DaysCompact = 'duration_days_compact',
  HoursCompact = 'duration_hours_compact',
  MinutesCompact = 'duration_minutes_compact',
  SecondsCompact = 'duration_seconds_compact',
}

export const useDuration = (mode: 'normal' | 'compact' = 'normal') => {
  const t = useT();

  let DAYS = DurationKeys.Days;
  let HOURS = DurationKeys.Hours;
  let MINUTES = DurationKeys.Minutes;
  let SECONDS = DurationKeys.Seconds;

  if (mode === 'compact') {
    DAYS = DurationKeys.DaysCompact;
    HOURS = DurationKeys.HoursCompact;
    MINUTES = DurationKeys.MinutesCompact;
    SECONDS = DurationKeys.SecondsCompact;
  }

  return (durationInMilliseconds: number) => {
    const duration = convertToDuration(durationInMilliseconds);

    const segments = [];

    if (duration.days > 0) {
      segments.push(t(DAYS, { count: duration.days }));
    }
    if (duration.hours > 0) {
      segments.push(t(HOURS, { count: duration.hours }));
    }
    if (duration.minutes > 0) {
      segments.push(t(MINUTES, { count: duration.minutes }));
    }
    if (duration.seconds > 0) {
      segments.push(t(SECONDS, { count: duration.seconds }));
    }

    if (segments.length > 0) {
      return segments.join(' ');
    }
    return t(SECONDS, { count: 0 });
  };
};
