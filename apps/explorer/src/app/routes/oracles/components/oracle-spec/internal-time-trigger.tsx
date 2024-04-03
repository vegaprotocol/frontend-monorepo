import { t } from '@vegaprotocol/i18n';
import type {
  DataSourceSpecConfigurationTimeTrigger,
  EthTimeTrigger,
  InternalTimeTrigger,
  Maybe,
} from '@vegaprotocol/types';
import secondsToMinutes from 'date-fns/secondsToMinutes';
import fromUnixTime from 'date-fns/fromUnixTime';

export interface OracleSpecInternalTimeTriggerProps {
  data: DataSourceSpecConfigurationTimeTrigger;
}

export function OracleSpecInternalTimeTrigger({
  data,
}: OracleSpecInternalTimeTriggerProps) {
  return (
    <div>
      <span>{t('Time')}</span>,&nbsp;
      {data.triggers.map((tr) => (
        <TimeTrigger data={tr} />
      ))}
    </div>
  );
}

export interface TimeTriggerProps {
  data: Maybe<InternalTimeTrigger> | Maybe<EthTimeTrigger>;
}

export function TimeTrigger({ data }: TimeTriggerProps) {
  const d = parseDate(data?.initial);

  return (
    <span key={JSON.stringify(data)}>
      {data?.initial ? (
        <span title={`${data.initial}`}>
          <strong>{t('starting at')}</strong>{' '}
          <em className="not-italic underline decoration-dotted">{d}</em>
        </span>
      ) : (
        ''
      )}
      {data?.every ? (
        <span title={`${data.every} ${t('seconds')}`}>
          , <strong>{t('every')}</strong>{' '}
          <em className="not-italic underline decor</em>ation-dotted">
            {secondsToMinutes(data.every)} {t('minutes')}
          </em>{' '}
        </span>
      ) : (
        ''
      )}
    </span>
  );
}

/**
 * Dates in oracle triggers can be (or maybe were previously) Unix Time or timestamps
 * depending on type. This function handles both cases and returns a nicely formatted date.
 *
 * @param date
 * @returns string Localestring for date
 */
export function parseDate(date?: string | number): string {
  if (!date) {
    return 'Invalid date';
  }
  const d = fromUnixTime(+date).toLocaleString();

  if (d === 'Invalid Date') {
    return new Date(date).toLocaleString();
  }

  return d;
}
