import { t } from '@vegaprotocol/i18n';
import fromUnixTime from 'date-fns/fromUnixTime';
import { getCharacterForOperator } from './operator';
import type { Condition } from '@vegaprotocol/types';

export interface OracleSpecCondition {
  data: Condition;
  type?: string;
}

export function OracleSpecCondition({ data, type }: OracleSpecCondition) {
  const c = getCharacterForOperator(data.operator);
  const value =
    type === 'DataSourceSpecConfigurationTime' && data.value
      ? fromUnixTime(parseInt(data.value)).toLocaleString()
      : data.value;
  const typeLabel =
    type === 'DataSourceSpecConfigurationTime' ? (
      <span>{t('Time')}</span>
    ) : (
      type
    );

  return (
    <li key={`${typeLabel}${c}${value}`}>
      {typeLabel} {c}{' '}
      {value && (
        <span
          title={data.value || value}
          className="underline decoration-dotted"
        >
          {value}
        </span>
      )}
    </li>
  );
}
