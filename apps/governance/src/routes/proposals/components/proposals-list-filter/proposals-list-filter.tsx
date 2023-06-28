import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FormGroup, Icon, Input } from '@vegaprotocol/ui-toolkit';
import { CollapsibleToggle } from '../../../../components/collapsible-toggle';
import type { Dispatch, SetStateAction } from 'react';

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
      <CollapsibleToggle
        toggleState={filterVisible}
        setToggleState={setFilterVisible}
        dataTestId={'proposal-filter-toggle'}
      >
        <div className="text-xl mb-4">{t('FilterProposals')}</div>
      </CollapsibleToggle>

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
