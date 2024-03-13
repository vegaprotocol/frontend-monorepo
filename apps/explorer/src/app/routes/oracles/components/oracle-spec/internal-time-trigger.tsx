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
  return (
    <span key={JSON.stringify(data)}>
      {data?.initial ? (
        <span title={`${data.initial}`}>
          <strong>{t('starting at')}</strong>{' '}
          <em className="not-italic underline decoration-dotted">
            {fromUnixTime(data.initial).toLocaleString()}
          </em>
        </span>
      ) : (
        ''
      )}
      {data?.every ? (
        <span title={`${data.every} ${t('seconds')}`}>
          , <strong>{t('every')}</strong>{' '}
          <em className="not-italic underline decoration-dotted">
            {secondsToMinutes(data.every)} {t('minutes')}
          </em>{' '}
        </span>
      ) : (
        ''
      )}
    </span>
  );
}
