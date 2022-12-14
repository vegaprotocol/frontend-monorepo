import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ButtonLink, FormGroup, Input } from '@vegaprotocol/ui-toolkit';
import type { Dispatch, SetStateAction } from 'react';

interface ProposalsListFilterProps {
  setFilterString: Dispatch<SetStateAction<string>>;
}

export const ProposalsListFilter = ({
  setFilterString,
}: ProposalsListFilterProps) => {
  const { t } = useTranslation();
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <div data-testid="proposals-list-filter" className="mb-4">
      {!filterVisible && (
        <ButtonLink
          onClick={() => setFilterVisible(true)}
          data-testid="set-proposals-filter-visible"
        >
          {t('FilterProposals')}
        </ButtonLink>
      )}
      {filterVisible && (
        <div data-testid="open-proposals-list-filter">
          <p>{t('FilterProposalsDescription')}</p>
          <FormGroup
            label="Filter text input"
            labelFor="filter-input"
            hideLabel={true}
          >
            <Input
              data-testid="filter-input"
              id="filter-input"
              onChange={(e) => setFilterString(e.target.value)}
            />
          </FormGroup>
        </div>
      )}
    </div>
  );
};
