import { t } from '@vegaprotocol/i18n';
import type { DataSourceSpecConfigurationTimeTrigger } from '@vegaprotocol/types';
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
      {data.triggers.map((tr) => {
        return (
          <span>
            {tr?.initial ? (
              <span title={`${tr.initial}`}>
                <strong>{t('starting at')}</strong>{' '}
                <em className="not-italic underline decoration-dotted">
                  {fromUnixTime(tr.initial).toLocaleString()}
                </em>
              </span>
            ) : (
              ''
            )}
            {tr?.every ? (
              <span title={`${tr.every} ${t('seconds')}`}>
                , <strong>{t('every')}</strong>{' '}
                <em className="not-italic underline decoration-dotted">
                  {secondsToMinutes(tr.every)} {t('minutes')}
                </em>{' '}
              </span>
            ) : (
              ''
            )}
          </span>
        );
      })}
    </div>
  );
}
