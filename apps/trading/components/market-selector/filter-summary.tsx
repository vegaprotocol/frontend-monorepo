import { Trans } from 'react-i18next';

export const FilterSummary = ({
  diff,
  resetFilters,
}: {
  diff: number;
  resetFilters: () => void;
}) => (
  <div className="p-2 text-center">
    <Trans
      i18nKey={
        diff > 0
          ? '{{count}} results excluded due to the applied filters. <0>Remove filters</0>.'
          : '{{count}} results included due to the applied filters. <0>Remove filters</0>.'
      }
      values={{ count: Math.abs(diff) }}
      components={[
        <button
          key="reset-filters"
          className="underline"
          onClick={() => {
            resetFilters();
          }}
        >
          Remove filters
        </button>,
      ]}
    />
  </div>
);
