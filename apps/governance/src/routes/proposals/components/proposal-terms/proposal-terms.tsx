import {
  RoundedWrapper,
  KeyValueTable,
  KeyValueTableRow,
  Icon,
} from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../../../lib/bignumber';
import { SubHeading } from '../../../../components/heading';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import classnames from 'classnames';

interface ProposalTermsProps {
  data: Record<string, unknown>;
}

const getParsedValue = (value: unknown) => {
  if (typeof value === 'string') {
    try {
      // Check if value is a number string - if so use bignumber to maintain precision
      if (/^\d+(\.\d+)?$/.test(value)) {
        return new BigNumber(value).toString();
      } else {
        // This would convert, for example, a JSON object ('{"key":"value"}')
        // into an actual JS object ({key: "value"})
        return JSON.parse(value);
      }
    } catch (error) {
      return value;
    }
  } else {
    return value;
  }
};

const renderKeyValue = (key: string, value: string | number) => (
  <KeyValueTable>
    <KeyValueTableRow>
      {key}
      {value}
    </KeyValueTableRow>
  </KeyValueTable>
);

const renderArray = (key: string, array: unknown[]) => {
  if (array.every((item) => typeof item === 'string')) {
    return renderKeyValue(key, array.join(', '));
  } else {
    return (
      <div>
        <div className="mb-2">{key}</div>
        {array.map((item, index) => (
          <div key={index}>
            <ProposalTermsRenderer data={item as Record<string, unknown>} />
          </div>
        ))}
      </div>
    );
  }
};

// Working with 'unknown' type as a proposal's terms can be in many shapes
const renderTerm = (key: string, value: unknown) => {
  const parsedValue = getParsedValue(value);

  if (parsedValue === null || typeof parsedValue === 'boolean') {
    return renderKeyValue(key, String(parsedValue));
  } else if (
    typeof parsedValue === 'string' ||
    typeof parsedValue === 'number'
  ) {
    return renderKeyValue(key, parsedValue);
  } else if (typeof parsedValue === 'object') {
    if (Array.isArray(parsedValue)) {
      return renderArray(key, parsedValue);
    } else {
      return (
        <div>
          <div className="my-2">{key}</div>
          <ProposalTermsRenderer
            data={parsedValue as Record<string, unknown>}
          />
        </div>
      );
    }
  } else {
    return JSON.stringify(parsedValue);
  }
};

const ProposalTermsRenderer = ({ data }: ProposalTermsProps) => {
  return (
    <RoundedWrapper paddingBottom={true}>
      {Object.keys(data)
        .filter(
          (key) =>
            !['__typename', 'closingDatetime', 'enactmentDatetime'].includes(
              key
            )
        )
        .map((key, index) => (
          <div key={index}>{renderTerm(key, data[key])}</div>
        ))}
    </RoundedWrapper>
  );
};

export const ProposalTerms = ({ data }: ProposalTermsProps) => {
  const { t } = useTranslation();
  const [showTerms, setShowTerms] = useState(false);
  const showTermsIconClasses = classnames('mb-4', {
    'rotate-180': showTerms,
  });

  return (
    <section data-testid="proposal-terms">
      <button
        onClick={() => setShowTerms(!showTerms)}
        data-testid="proposal-terms-toggle"
      >
        <div className="flex items-center gap-3">
          <SubHeading title={t('proposalDetails')} />
          <div className={showTermsIconClasses}>
            <Icon name="chevron-down" size={8} />
          </div>
        </div>
      </button>

      {showTerms && <ProposalTermsRenderer data={data} />}
    </section>
  );
};
