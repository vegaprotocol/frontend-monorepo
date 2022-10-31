import type { ReactNode } from 'react';
import classNames from 'classnames';
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
}: Props) => {
  return (
    <div
      className={classNames(
        '-mt-1 ease-in-out transition-[max-height] max-h-0 overflow-hidden duration-200',
        {
          'max-h-[500px]': errorMessage,
        }
      )}
    >
      <InputError
        intent={errorMessage?.isDisabled ? 'danger' : 'warning'}
        data-testid={dataTestId}
      >
        {errorMessage?.message}
      </InputError>
    </div>
  );
};
