import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, FormGroup, Input } from '@vegaprotocol/ui-toolkit';
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
    <div data-testid="proposals-list-filter">
      {!filterVisible && (
        <Button
          onClick={() => setFilterVisible(true)}
          variant="inline-link"
          className="pl-0 pb-20"
          data-testid="set-proposals-filter-visible"
        >
          {t('FilterProposals')}
        </Button>
      )}
      {filterVisible && (
        <div data-testid="open-proposals-list-filter">
          <p>{t('FilterProposalsDescription')}</p>
          <FormGroup
            labelClassName="sr-only"
            label="Filter text input"
            labelFor="filter-input"
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
