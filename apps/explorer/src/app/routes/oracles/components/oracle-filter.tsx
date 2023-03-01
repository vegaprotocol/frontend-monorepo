import { t } from '@vegaprotocol/i18n';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import filter from 'recursive-key-filter';
import type { ExplorerOracleDataSourceFragment } from '../__generated__/Oracles';

interface OracleFilterProps {
  data: ExplorerOracleDataSourceFragment;
}

export type Filter =
  ExplorerOracleDataSourceFragment['dataSourceSpec']['spec']['data']['sourceType']['sourceType'];

/**
 * Given the main Filter view just uses a JSON dump view, this function
 * selects the correct filter to dump in to that view. Internal oracles
 * (i.e. the Time oracle) have conditions while external data sources
 * have filters
 *
 * @param s A data source
 * @returns Object an object containing conditions or filters
 */
export function getConditionsOrFilters(s: Filter) {
  if (s.__typename === 'DataSourceSpecConfiguration') {
    return s.filters;
  } else if (s.__typename === 'DataSourceSpecConfigurationTime') {
    return s.conditions;
  }
  return null;
}

/**
 * Shows the conditions that this oracle is using to filter
 * data sources.
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
  const f = getConditionsOrFilters(s);

  if (!f) {
    return null;
  }

  return (
    <details>
      <summary>{t('Filter')}</summary>
      <SyntaxHighlighter data={filter(f, ['__typename'])} />
    </details>
  );
}
