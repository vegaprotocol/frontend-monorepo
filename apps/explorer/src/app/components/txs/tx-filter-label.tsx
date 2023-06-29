import { t } from '@vegaprotocol/i18n';

export interface FilterLabelProps {
  filters: Set<string>;
}

/**
 * Renders the list (currently limited to 1) of filters set by the
 * Transaction Filter
 */
export function FilterLabel({ filters }: FilterLabelProps) {
  if (!filters || filters.size !== 1) {
    return (
      <span data-testid="filter-empty" className="uppercase">
        {t('Filter')}
      </span>
    );
  }

  return (
    <div data-testid="filter-selected">
      <span className="uppercase">{t('Filters')}:</span>&nbsp;
      <code className="bg-vega-light-150 dark:bg-vega-light-300 px-2 rounded-md capitalize dark:text-black">
        {Array.from(filters)[0]}
      </code>
    </div>
  );
}
