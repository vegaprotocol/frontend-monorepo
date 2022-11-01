import { FormGroup } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';
import { Toggle } from '@vegaprotocol/ui-toolkit';
import type { DealTicketErrorMessage } from './deal-ticket-error';
import { DealTicketError } from './deal-ticket-error';
import { DEAL_TICKET_SECTION } from '../constants';

interface TypeSelectorProps {
  value: Schema.OrderType;
  onSelect: (type: Schema.OrderType) => void;
  errorMessage?: DealTicketErrorMessage;
}

const toggles = [
  { label: t('Market'), value: Schema.OrderType.TYPE_MARKET },
  { label: t('Limit'), value: Schema.OrderType.TYPE_LIMIT },
];

export const TypeSelector = ({
  value,
  onSelect,
  errorMessage,
}: TypeSelectorProps) => {
  return (
    <FormGroup label={t('Order type')} labelFor="order-type">
      <Toggle
        id="order-type"
        name="order-type"
        toggles={toggles}
        checkedValue={value}
        onChange={(e) => onSelect(e.target.value as Schema.OrderType)}
      />
      <DealTicketError
        errorMessage={errorMessage}
        data-testid="dealticket-error-message-type"
        section={DEAL_TICKET_SECTION.TYPE}
      />
    </FormGroup>
  );
};
