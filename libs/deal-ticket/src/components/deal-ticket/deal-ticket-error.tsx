import type { ReactNode } from 'react';
import { InputError } from '@vegaprotocol/ui-toolkit';

export interface DealTicketErrorMessage {
  message: ReactNode | string;
  isDisabled: boolean;
}

interface Props {
  errorMessage?: DealTicketErrorMessage;
  'data-testid'?: string;
}

export const DealTicketError = ({
  errorMessage,
  'data-testid': dataTestId = 'deal-ticket-error-message',
}: Props) =>
  errorMessage ? (
    <div className="-mt-1">
      <InputError
        intent={errorMessage.isDisabled ? 'danger' : 'warning'}
        data-testid={dataTestId}
      >
        {errorMessage.message}
      </InputError>
    </div>
  ) : null;
