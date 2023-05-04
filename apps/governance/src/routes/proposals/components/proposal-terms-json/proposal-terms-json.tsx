import { useTranslation } from 'react-i18next';
import { Icon, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { SubHeading } from '../../../../components/heading';
import type { PartialDeep } from 'type-fest';
import type * as Schema from '@vegaprotocol/types';
import { useState } from 'react';
import classnames from 'classnames';

export const ProposalTermsJson = ({
  terms,
}: {
  terms: PartialDeep<Schema.ProposalTerms>;
}) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const showDetailsIconClasses = classnames('mb-4', {
    'rotate-180': showDetails,
  });

  return (
    <section>
      <button onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center gap-3">
          <SubHeading title={t('proposalTerms')} />
          <div className={showDetailsIconClasses}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {showDetails && <SyntaxHighlighter data={terms} />}
    </section>
  );
};
