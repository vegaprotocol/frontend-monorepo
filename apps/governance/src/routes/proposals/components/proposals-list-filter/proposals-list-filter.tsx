import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FormGroup, Icon, Input } from '@vegaprotocol/ui-toolkit';
import type { Dispatch, SetStateAction } from 'react';
import { collapsibleToggleStyles } from '../../../../lib/collapsible-toggle-styles';

interface ProposalsListFilterProps {
  filterString: string;
  setFilterString: Dispatch<SetStateAction<string>>;
}

export const ProposalsListFilter = ({
  filterString,
  setFilterString,
}: ProposalsListFilterProps) => {
  const { t } = useTranslation();
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <div data-testid="proposals-list-filter" className="mb-4">
      <button
        onClick={() => setFilterVisible(!filterVisible)}
        data-testid="proposal-filter-toggle"
      >
        <div className="flex items-center gap-3">
          <div className="text-xl mb-4">{t('FilterProposals')}</div>
          <div className={collapsibleToggleStyles(filterVisible)}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {filterVisible && (
        <div data-testid="proposals-list-filter-visible">
          <p>{t('FilterProposalsDescription')}</p>
          <FormGroup
            label="Filter text input"
            labelFor="filter-input"
            hideLabel={true}
            className="relative"
          >
            <Input
              value={filterString}
              data-testid="filter-input"
              id="filter-input"
              onChange={(e) => setFilterString(e.target.value)}
              className="pr-8"
            />
            {filterString && filterString.length > 0 && (
              <button
                className="absolute top-2 right-2"
                onClick={() => setFilterString('')}
                data-testid="clear-filter"
              >
                <Icon name="cross" size={6} className="text-vega-light-200" />
              </button>
            )}
          </FormGroup>
        </div>
      )}
    </div>
  );
};
