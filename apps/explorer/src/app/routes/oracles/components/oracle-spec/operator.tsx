import { t } from '@vegaprotocol/i18n';
import type { ConditionOperator } from '@vegaprotocol/types';

export function getCharacterForOperator(
  operator: ConditionOperator
): React.ReactElement {
  switch (operator) {
    case 'OPERATOR_EQUALS':
      return <span title={t('equals')}>=</span>;
    case 'OPERATOR_GREATER_THAN':
      return <span title={t('greater than')}>&gt;</span>;
    case 'OPERATOR_GREATER_THAN_OR_EQUAL':
      return <span title={t('greater than or equal')}>&ge;</span>;
    case 'OPERATOR_LESS_THAN':
      return <span title={t('less than')}>&lt;</span>;
    case 'OPERATOR_LESS_THAN_OR_EQUAL':
      return <span title={t('less than or equal')}>&le;</span>;
  }

  return <span>{operator}</span>;
}
