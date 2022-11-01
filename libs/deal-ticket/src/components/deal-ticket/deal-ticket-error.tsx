import type { ReactNode } from 'react';
import { InputError } from '@vegaprotocol/ui-toolkit';
import type { DealTicketSection } from '../deal-ticket-validation';

export interface DealTicketErrorMessage {
  message: ReactNode | string;
  isDisabled: boolean;
  errorSection: DealTicketSection;
}

interface Props {
  errorMessage?: DealTicketErrorMessage;
  'data-testid'?: string;
  section: DealTicketSection | DealTicketSection[];
}

export const DealTicketError = ({
  errorMessage,
  'data-testid': dataTestId = 'deal-ticket-error-message',
  section,
}: Props) =>
  errorMessage &&
  (Array.isArray(section) ? section : [section]).includes(
    errorMessage.errorSection
  ) ? (
    <div className="-mt-1">
      <InputError
        intent={errorMessage.isDisabled ? 'danger' : 'warning'}
        data-testid={dataTestId}
      >
        {errorMessage.message}
      </InputError>
    </div>
  ) : null;
