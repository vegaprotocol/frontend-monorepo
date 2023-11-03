import type { ExplorerOracleDataSourceFragment } from '../__generated__/Oracles';
import { OracleSpecInternalTimeTrigger } from './oracle-spec/internal-time-trigger';
import { OracleSpecCondition } from './oracle-spec/condition';
import { getCharacterForOperator } from './oracle-spec/operator';

interface OracleFilterProps {
  data: ExplorerOracleDataSourceFragment;
}

/**
 * Shows the conditions that this oracle is using to filter
 * data sources, as a list.
 *
 * Renders nothing if there is no data (which will frequently)
 * be the case) and if there is data, currently renders a simple
 * JSON view.
 */
export function OracleFilter({ data }: OracleFilterProps) {
  if (!data?.dataSourceSpec?.spec?.data?.sourceType) {
    return null;
  }

  const s = data.dataSourceSpec.spec.data.sourceType.sourceType;
  if (s.__typename === 'DataSourceSpecConfigurationTime' && s.conditions) {
    return (
      <ul>
        {s.conditions
          .filter((c) => !!c)
          .map((c) => {
            if (!c) {
              return null;
            }
            return (
              <OracleSpecCondition key={c.value} data={c} type={s.__typename} />
            );
          })}
      </ul>
    );
  } else if (
    s.__typename === 'DataSourceSpecConfigurationTimeTrigger' &&
    s.triggers
  ) {
    return <OracleSpecInternalTimeTrigger data={s} />;
  } else if (
    s.__typename === 'EthCallSpec' ||
    s.__typename === 'DataSourceSpecConfiguration'
  ) {
    if (s.filters !== null && s.filters && 'filters' in s) {
      return (
        <ul>
          {s.filters.map((f) => {
            const prop = <code title={f.key.type}>{f.key.name}</code>;

            if (!f.conditions || f.conditions.length === 0) {
              return prop;
            } else {
              return f.conditions.map((c) => {
                return (
                  <li key={`${prop}${c.value}`}>
                    {prop} {getCharacterForOperator(c.operator)}{' '}
                    <code>{c.value ? c.value : '-'}</code>
                  </li>
                );
              });
            }
          })}
        </ul>
      );
    }
  }

  return null;
}
